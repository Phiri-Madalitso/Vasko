# Bygges fra server/: docker build -t vasko-server server
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Directory.Build.props .editorconfig Vasko.slnx ./
COPY src/Vasko.Server/Vasko.Server.csproj src/Vasko.Server/
RUN dotnet restore src/Vasko.Server/Vasko.Server.csproj
COPY src/ src/
RUN dotnet publish src/Vasko.Server/Vasko.Server.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_RUNNING_IN_CONTAINER=true
COPY --from=build /app .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Vasko.Server.dll"]
