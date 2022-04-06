using System;
using System.Collections.Generic;
using System.Reflection;
using System.Data.SqlClient;
using System.Linq;

namespace Backend
{
  public class DatabaseUtil
  {
    public static void InsertTable(TableName tablename, object insertObject)
    {
      List<string> propertisArr = new List<string>();
      List<string> valuesArr = new List<string>();

      foreach (PropertyInfo prop in insertObject.GetType().GetProperties())
      {
        propertisArr.Add(prop.Name.ToString());
        string propvalue = prop.GetValue(insertObject, null).ToString();
        if (propvalue == "True" || propvalue == "False")
        {
          valuesArr.Add(propvalue == "True" ? "1" : "0");
        }
        else
        {
          valuesArr.Add(propvalue.Replace(',', '.'));
        }
      }

      string columns = String.Join(",", propertisArr);
      string values = String.Join(",", valuesArr);

      string sqlCommand = $"INSERT INTO {tablename.ToString()} ({columns}) VALUES ({values})";
      SqlConnection cnn = getDatabaseConnection();
      
      try {
        SqlCommand cm = new SqlCommand(sqlCommand, cnn);
        cm.ExecuteNonQuery();
      } catch(Exception err){
        Console.WriteLine(String.Format("ErrorSQL: {0} : {1}", DateTime.Now, sqlCommand));
        throw err;
      }
      cnn.Close();
    }

    public static void InsertArray<T>(TableName tableName, ref T[] insertObject){
      IEnumerable<string> properties = insertObject[0]
                                        .GetType()
                                        .GetProperties()
                                        .Select(pro => pro.Name);
                                        
      string values = String.Join(",", insertObject.Select(child => {
        string insertElement =  
          "(" + 
            String.Join(",", child
              .GetType()
              .GetProperties()
              .Select(pro => pro.GetValue(child, null).ToString()))
          + ")";
        return insertElement;
      }));

      string sqlCommand = $"INSERT INTO {tableName.ToString()} ({String.Join(",", properties)}) VALUES {values}";
      SqlConnection cnn = getDatabaseConnection();
      SqlCommand cm = new SqlCommand(sqlCommand, cnn);
      try {
        cm.ExecuteNonQuery();
        cnn.Close();
      } catch(Exception err){
        Console.WriteLine(String.Format("ErrorSQL: {0} : {1}"), DateTime.Now, sqlCommand);
        throw err;
      }

    }

    public static void InsertHourlyReport(MyHourlyReport[] reports){
      int Day = reports[0].Day;
      int StationID = reports[0].StationID;
      SqlConnection cnn = getDatabaseConnection();
      SqlCommand command = new SqlCommand(
        String.Format("DELETE FROM {0} WHERE StationID='{1}' AND Day='{2}'", TableName.DataDay, StationID, Day),
        cnn
      );
      command.ExecuteNonQuery();
      cnn.Close();
      BackendNode node = new BackendNode();
      String endpoint = "db51";
      node.Post(endpoint, reports);
      // InsertArray(TableName.DataDay,ref reports);
    }

    public static SqlConnection getDatabaseConnection()
    {
      string connectionString = @"Data Source=14.225.11.51;Initial Catalog=NT6;User ID=sa;Password='!@#Opennet123;;!@#'";
      SqlConnection sqlConneciton;
      sqlConneciton = new SqlConnection(connectionString);
      sqlConneciton.Open();
      return sqlConneciton;
    }
  }
}