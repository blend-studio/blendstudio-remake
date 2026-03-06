namespace backend.Services
{
    /// <summary>
    /// BackgroundService che sincronizza Wrike ogni 15 minuti.
    ///
    /// Utilizza IServiceScopeFactory perché WrikeService è registrato
    /// come Scoped ma BackgroundService è Singleton.
    /// </summary>
    public class WrikeSyncJob : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(15);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<WrikeSyncJob> _logger;

        public WrikeSyncJob(IServiceScopeFactory scopeFactory, ILogger<WrikeSyncJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[WrikeSyncJob] Avviato. Intervallo: {Interval} min.", Interval.TotalMinutes);

            // Prima sincronizzazione immediata all'avvio
            await RunSyncAsync(stoppingToken);

            using var timer = new PeriodicTimer(Interval);
            while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
            {
                await RunSyncAsync(stoppingToken);
            }
        }

        private async Task RunSyncAsync(CancellationToken ct)
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var wrike = scope.ServiceProvider.GetRequiredService<WrikeService>();
                await wrike.SyncAllAsync(ct);
            }
            catch (OperationCanceledException)
            {
                // Normale durante lo shutdown
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[WrikeSyncJob] Errore durante la sincronizzazione.");
            }
        }
    }
}
