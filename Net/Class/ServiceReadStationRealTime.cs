using Microsoft.Extensions.Logging;
using System.Threading;
using Microsoft.Extensions.Hosting;
using System.Threading.Tasks;
using S7.Net;
using System.Collections.Generic;
namespace Backend {
  public class ReadStationRealTime: IHostedService {
    private readonly ILogger<ReadStationRealTime> _logger;
    private readonly IHostApplicationLifetime _appLifetime;
    public ReadStationRealTime(
      ILogger<ReadStationRealTime> logger,
      IHostApplicationLifetime appLifetime
    ){
      this._logger = logger;
      this._appLifetime = appLifetime;  
    }
    public Task StopAsync(CancellationToken stoppingToken){
      return Task.CompletedTask;
    }

    public Task StartAsync(CancellationToken token){
      this._logger.LogInformation("Read realTime Stations");
      DKGStation saitex   = DKGStationFactory.getInstance(StationConfig.Saitex);
      DKGStation sinoma   = DKGStationFactory.getInstance(StationConfig.Sinoma);
      DKGStation menchuen = DKGStationFactory.getInstance(StationConfig.Menchuen);
      DKGStation kcc      = DKGStationFactory.getInstance(StationConfig.Kcc);
      DKGStation noxasean = DKGStationFactory.getInstance(StationConfig.Noxasean);
      DKGStation seah     = DKGStationFactory.getInstance(StationConfig.Seah);
      return Task.Factory.StartNew(async () => { 
        while(!token.IsCancellationRequested){
          List<Task> tasks = new List<Task>();
          tasks.Add(saitex.readSensorRealTimeStatus());
          tasks.Add(sinoma.readSensorRealTimeStatus());
          tasks.Add(menchuen.readSensorRealTimeStatus());
          tasks.Add(kcc.readSensorRealTimeStatus());
          tasks.Add(noxasean.readSensorRealTimeStatus());
          tasks.Add(seah.readSensorRealTimeStatus());
          // Helper.writeObject(saitex.sensorDataType);
          // another station
          // another station
          Task.WaitAll(tasks.ToArray());
          await Task.Delay(10000, token);
        }
      });
    }
  }
}