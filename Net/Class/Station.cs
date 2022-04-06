using System;
using S7.Net;
using System.Net;
using System.Net.Http;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Backend {
  public class DKGStation
  {
    private int hourlyReportErrorCount = 0;
    private DateTime hourlyReportLastRun = DateTime.Now.AddDays(-1).Date;
    public bool realTime_Loop = true;
    public string name;
    private string ip;
    public short StationID;
    // public Plc sensor;
    private int lastConnectionStatus = 0; // 0 : DISCONNECTED 1: CONNECTED
    public DKGStation(StationConfigModel config)
    {
      this.name                 = config.name;
      this.ip                   = config.ip;
      this.StationID            = config.stationID;
    }
    private void updateConnectionStatus(int status)
    {
      if (status != this.lastConnectionStatus)
      {
        if(status == 0){
          Console.WriteLine(String.Format("{0} : {1} Connection has been switched to closed", DateTime.Now, this.name));
        }
        
        this.lastConnectionStatus = status;
        DatabaseUtil.InsertTable(TableName.ConnectionHistory, new
        {
          Time = (long)(System.DateTime.UtcNow.Subtract(new System.DateTime(1970, 1, 1))).TotalMilliseconds,
          ID = this.StationID,
          Status = status
        });
      }
    }

    private async Task<Plc> connectPlc(){
      Plc sensor = new Plc(CpuType.S71200, this.ip, 0, 0);
      int maxRetry = 5;
      int startTry = 1;
      int delay    = 1;
      for(;;){
        sensor.Open();
        if(sensor.IsConnected){
          this.updateConnectionStatus(1);
          break;
        } else {
          startTry++;
          if(startTry > maxRetry){
            this.updateConnectionStatus(0);
            Console.WriteLine(String.Format("{0} : Reached {1} time while connecting to Plc station {2}", DateTime.Now, maxRetry, this.name.ToUpper()));
            break;
          }
          await Task.Delay(delay);
        }
      }
      return sensor;
    }

    public Task readSensorRealTimeStatus()
    {
      return Task.Run(async () => { 
        if(!this.realTime_Loop) return;
        Plc sensor = await connectPlc();
        RealtimeEVC realTime = new RealtimeEVC();
        if (sensor.IsConnected)
        {
          try {
            sensor.ReadClass(realTime, 50);
            sensor.Close();
          } catch(Exception err){
            // send message to system admin
            Console.WriteLine(String.Format("{0} : {1} : {2}", this.name, DateTime.Now, err.StackTrace));
          }
        } else {
        }
        realTime.ID = this.StationID;
        this.updateRealTime(realTime);
      });
    }

    private void updateRealTime(RealtimeEVC realTime){
      BackendNode node = new BackendNode();
      String endpoint = "realTime";
      node.Post(endpoint, realTime);
    }
    
    public async Task readHourlyReport(){
      var currentTime = DateTime.Now.Date;
      if((currentTime - this.hourlyReportLastRun).Days == 0) return;
      Console.WriteLine("{0}:{1} read hourly report", DateTime.Now, this.name);
      Plc sensor = await connectPlc();
      if(sensor.IsConnected){
        try {
          StationReportHourly stationReportHourlyHolder = new StationReportHourly();
          sensor.ReadClass(stationReportHourlyHolder, 52);
          MyHourlyReport[] hourlyReportArray = Helper.HourlyReportToArray(stationReportHourlyHolder);
          DatabaseUtil.InsertHourlyReport(hourlyReportArray);
          sensor.Close();
          this.hourlyReportLastRun = currentTime;
        } catch(Exception err){
          this.hourlyReportErrorCount++;
          if(this.hourlyReportErrorCount > 5){
            Console.WriteLine("{0} : {1} Failed to read hourly report. Reached {2} retried.", DateTime.Now, this.name, this.hourlyReportErrorCount);
            Console.WriteLine(err.StackTrace);
            this.hourlyReportLastRun = currentTime;
          }
        }
      }
      
    }
  }

  public class DKGStationFactory {
    private static List<DKGStation> store = new List<DKGStation>();

    public static DKGStation getInstance(StationConfigModel config){
      var lookupStation = store.Find(station => station.StationID == config.stationID);
      if(lookupStation == null){
        DKGStation newInstance = new DKGStation(config);
        store.Add(newInstance);
        return newInstance;
      }
      return lookupStation;
    }
  }

  public class BackendNode {
    private Cookie cookie = new Cookie("dkgas", "1loveyouvt123");
    private HttpClientHandler requesthandler = new HttpClientHandler { UseCookies = false };
    private HttpClient client;
    private Uri baseUri = new Uri("http://localhost:4445/");
    
    public BackendNode(){
      client = new HttpClient(requesthandler);
      requesthandler.CookieContainer = new CookieContainer();
      requesthandler.UseCookies = true;
      requesthandler.CookieContainer.Add(baseUri, this.cookie);
      client.BaseAddress = baseUri;
    }

    public async void Post(String url, object body){
      byte[] buffer = System.Text.Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(body));
      ByteArrayContent byteContent = new ByteArrayContent(buffer);
      byteContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
      HttpResponseMessage message;
      try {
        message = await client.PostAsync(url, byteContent);
      } catch(Exception err){
        Console.WriteLine(err.StackTrace);
      }
    }
  }
}