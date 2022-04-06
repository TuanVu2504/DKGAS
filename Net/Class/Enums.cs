namespace Backend {
  public enum TableName
  {
    ConnectionHistory,
    realtimeEVC,
    DataDay,
    Duty,

  }

  public static class StationConfig
  {
    public static StationConfigModel Saitex = new StationConfigModel("192.168.6.2","saitex", 67);
    public static StationConfigModel Sinoma = new StationConfigModel("192.168.7.2","sinoma", 62);
    public static StationConfigModel Menchuen = new StationConfigModel("192.168.8.2","menchuen", 70);
    public static StationConfigModel Kcc = new StationConfigModel("192.168.9.2","kcc", 71);  
    public static StationConfigModel Noxasean = new StationConfigModel("192.168.10.2","noxasean", 72);
    
    public static StationConfigModel Seah = new StationConfigModel("192.168.11.2","seah", 61);
  }

  public class StationConfigModel {
    public string ip;
    public string name;
    public short stationID;
    public StationConfigModel(string ip, string name, short stationID){
      this.ip = ip;
      this.name = name;
      this.stationID = stationID;
    }
  }
}