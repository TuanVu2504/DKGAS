using System;
using System.Reflection;
namespace Backend {
  public class Helper {
    public static void writeObject(object ob){
      PropertyInfo[] prolist = ob.GetType().GetProperties();
      foreach(PropertyInfo pro in prolist){
        String value;
        String _value = pro.GetValue(ob).ToString();
        if(_value == "False" || _value == "True"){
          if(_value == "True"){
            value = "1";
          } else {
            value = "2";
          }
        } else {
          value = _value;
        }
        Console.WriteLine("{0}: {1}: {2}",Array.IndexOf(prolist, pro) ,pro.Name, value);
      }
    }

    public static MyHourlyReport[] HourlyReportToArray(StationReportHourly hourlyReport){
      MyHourlyReport[] reports = new MyHourlyReport[25];
      PropertyInfo[] propsList = hourlyReport.GetType().GetProperties();
      int reportsIndex = 0;
      for(int startIndex = 2; startIndex < propsList.Length; startIndex+=11){
        short Time          = Convert.ToInt16(propsList[startIndex].GetValue(hourlyReport, null));
        double PLine1       = Convert.ToDouble(propsList[startIndex+1].GetValue(hourlyReport, null));
        double TLine1       = Convert.ToDouble(propsList[startIndex+2].GetValue(hourlyReport, null));
        double VbLine1      = Convert.ToDouble(propsList[startIndex+3].GetValue(hourlyReport, null));
        double VmLine1      = Convert.ToDouble(propsList[startIndex+4].GetValue(hourlyReport, null));
        double EngeryLine1  = Convert.ToDouble(propsList[startIndex+5].GetValue(hourlyReport, null));
        double PLine2       = Convert.ToDouble(propsList[startIndex+6].GetValue(hourlyReport, null));
        double TLine2       = Convert.ToDouble(propsList[startIndex+7].GetValue(hourlyReport, null));
        double VbLine2      = Convert.ToDouble(propsList[startIndex+8].GetValue(hourlyReport, null));
        double VmLine2      = Convert.ToDouble(propsList[startIndex+9].GetValue(hourlyReport, null));
        double EngeryLine2  = Convert.ToDouble(propsList[startIndex+10].GetValue(hourlyReport, null));
        MyHourlyReport report = new MyHourlyReport(
          hourlyReport.Day,
          hourlyReport.ID,
          Time,    
          PLine1,
          TLine1, 
          VbLine1, 
          VmLine1,  
          EngeryLine1,
          PLine2,
          TLine2,
          VbLine2,
          VmLine2,
          EngeryLine2
        );
        reports[reportsIndex] = report;
        reportsIndex = reportsIndex + 1;
      }
      return reports;
    }
  }
}