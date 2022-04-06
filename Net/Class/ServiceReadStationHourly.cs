using Microsoft.Extensions.Logging;
using System.Threading;
using Microsoft.Extensions.Hosting;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
namespace Backend {
  public class ReadStationHourly: IHostedService {
    private readonly ILogger<ReadStationRealTime> _logger;
    private readonly IHostApplicationLifetime _appLifetime;
    public ReadStationHourly(
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
      DKGStation saitex   = DKGStationFactory.getInstance(StationConfig.Saitex);
      DKGStation sinoma   = DKGStationFactory.getInstance(StationConfig.Sinoma);
      DKGStation menchuen = DKGStationFactory.getInstance(StationConfig.Menchuen);
      DKGStation kcc      = DKGStationFactory.getInstance(StationConfig.Kcc);
      DKGStation noxasean = DKGStationFactory.getInstance(StationConfig.Noxasean);
      DKGStation seah     = DKGStationFactory.getInstance(StationConfig.Seah);
      return Task.Factory.StartNew(async() => {
        while(!token.IsCancellationRequested){
          List<Task> tasks = new List<Task>();
          tasks.Add(saitex.readHourlyReport());
          tasks.Add(sinoma.readHourlyReport());
          tasks.Add(menchuen.readHourlyReport());
          tasks.Add(kcc.readHourlyReport());
          tasks.Add(noxasean.readHourlyReport());
          tasks.Add(seah.readHourlyReport());
          await Task.WhenAll(tasks.ToArray());
          await Task.Delay(1000, token);
        }
      });
    }
  }
}