using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;

namespace Backend
{
  class Program
  {
    static async Task Main(string[] args)
    {
      await Host.CreateDefaultBuilder(args)
        .ConfigureServices((hostContext, services) =>
        {
          services.AddHostedService<ReadStationRealTime>();
          services.AddHostedService<ReadStationHourly>();
        })
        .RunConsoleAsync();
    }
  }
}
