FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiamo prima il fiejl csproj per sfruttare la cache di Docker
COPY ["backend.csproj", "./"]
RUN dotnet restore "./backend.csproj"

# Copiamo il resto e buildiamo
COPY . .
RUN dotnet build "backend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "backend.dll"]
