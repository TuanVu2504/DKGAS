namespace Backend
{
    public class MyHourlyReport {
        public int Day { get; set; }
        public short StationID { get; set; }
        //00h
        public short Time { get; set; }
        public double Pevc1 { get; set; }
        public double Tevc1 { get; set; }
        public double Vb_line1 { get; set; }
        public double Vm_line1 { get; set; }
        public double Energy_line1 { get; set; }
        public double Pevc2 { get; set; }
        public double Tevc2 { get; set; }
        public double Vb_line2 { get; set; }
        public double Vm_line2 { get; set; }
        public double Energy_line2 { get; set; }

        public MyHourlyReport(
          int Day, 
          short ID, 
          short Time, 
          double Pevc1, 
          double Tevc1, 
          double Vb_line1, 
          double Vm_line1, 
          double Energy_line1, 
          double Pevc2, 
          double Tevc2, 
          double Vb_line2, 
          double Vm_line2, 
          double Engery_line2
        ){
            this.Time           = Time;
            this.Day            = Day;
            this.StationID      = ID;
            this.Energy_line1   = Energy_line1;
            this.Energy_line2   = Energy_line2;
            this.Vm_line2       = Vm_line2;
            this.Vm_line1       = Vm_line1;
            this.Vb_line1       = Vb_line1;
            this.Vb_line2       = Vb_line2;
            this.Tevc1          = Tevc1;
            this.Tevc2          = Tevc2;
            this.Pevc1          = Pevc1;
            this.Pevc2          = Pevc2;
        }
    }
    public class StationReportHourly
    {
        public int Day { get; set; }
        public short ID { get; set; }
        //00h
        public double Time00 { get; set; }
        public double Pevc1_00 { get; set; }
        public double Tevc1_00 { get; set; }
        public double Vb_line1_00 { get; set; }
        public double Vm_line1_00 { get; set; }
        public double Energy_line1_00 { get; set; }
        public double Pevc2_00 { get; set; }
        public double Tevc2_00 { get; set; }
        public double Vb_line2_00 { get; set; }
        public double Vm_line2_00 { get; set; }
        public double Energy_line2_00 { get; set; }
        //01h
        public double Time01 { get; set; }
        public double Pevc1_01 { get; set; }
        public double Tevc1_01 { get; set; }
        public double Vb_line1_01 { get; set; }
        public double Vm_line1_01 { get; set; }
        public double Energy_line1_01 { get; set; }
        public double Pevc2_01 { get; set; }
        public double Tevc2_01 { get; set; }
        public double Vb_line2_01 { get; set; }
        public double Vm_line2_01 { get; set; }
        public double Energy_line2_01 { get; set; }
        //02h
        public double Time02 { get; set; }
        public double Pevc1_02 { get; set; }
        public double Tevc1_02 { get; set; }
        public double Vb_line1_02 { get; set; }
        public double Vm_line1_02 { get; set; }
        public double Energy_line1_02 { get; set; }
        public double Pevc2_02 { get; set; }
        public double Tevc2_02 { get; set; }
        public double Vb_line2_02 { get; set; }
        public double Vm_line2_02 { get; set; }
        public double Energy_line2_02 { get; set; }
        //03h
        public double Time03 { get; set; }
        public double Pevc1_03 { get; set; }
        public double Tevc1_03 { get; set; }
        public double Vb_line1_03 { get; set; }
        public double Vm_line1_03 { get; set; }
        public double Energy_line1_03 { get; set; }
        public double Pevc2_03 { get; set; }
        public double Tevc2_03 { get; set; }
        public double Vb_line2_03 { get; set; }
        public double Vm_line2_03 { get; set; }
        public double Energy_line2_03 { get; set; }
        //04h
        public double Time04 { get; set; }
        public double Pevc1_04 { get; set; }
        public double Tevc1_04 { get; set; }
        public double Vb_line1_04 { get; set; }
        public double Vm_line1_04 { get; set; }
        public double Energy_line1_04 { get; set; }
        public double Pevc2_04 { get; set; }
        public double Tevc2_04 { get; set; }
        public double Vb_line2_04 { get; set; }
        public double Vm_line2_04 { get; set; }
        public double Energy_line2_04 { get; set; }
        //05h
        public double Time05 { get; set; }
        public double Pevc1_05 { get; set; }
        public double Tevc1_05 { get; set; }
        public double Vb_line1_05 { get; set; }
        public double Vm_line1_05 { get; set; }
        public double Energy_line1_05 { get; set; }
        public double Pevc2_05 { get; set; }
        public double Tevc2_05 { get; set; }
        public double Vb_line2_05 { get; set; }
        public double Vm_line2_05 { get; set; }
        public double Energy_line2_05 { get; set; }
        //06h
        public double Time06 { get; set; }
        public double Pevc1_06 { get; set; }
        public double Tevc1_06 { get; set; }
        public double Vb_line1_06 { get; set; }
        public double Vm_line1_06 { get; set; }
        public double Energy_line1_06 { get; set; }
        public double Pevc2_06 { get; set; }
        public double Tevc2_06 { get; set; }
        public double Vb_line2_06 { get; set; }
        public double Vm_line2_06 { get; set; }
        public double Energy_line2_06 { get; set; }
        //07h
        public double Time07 { get; set; }
        public double Pevc1_07 { get; set; }
        public double Tevc1_07 { get; set; }
        public double Vb_line1_07 { get; set; }
        public double Vm_line1_07 { get; set; }
        public double Energy_line1_07 { get; set; }
        public double Pevc2_07 { get; set; }
        public double Tevc2_07 { get; set; }
        public double Vb_line2_07 { get; set; }
        public double Vm_line2_07 { get; set; }
        public double Energy_line2_07 { get; set; }
        //08h
        public double Time08 { get; set; }
        public double Pevc1_08 { get; set; }
        public double Tevc1_08 { get; set; }
        public double Vb_line1_08 { get; set; }
        public double Vm_line1_08 { get; set; }
        public double Energy_line1_08 { get; set; }
        public double Pevc2_08 { get; set; }
        public double Tevc2_08 { get; set; }
        public double Vb_line2_08 { get; set; }
        public double Vm_line2_08 { get; set; }
        public double Energy_line2_08 { get; set; }
        //09h
        public double Time09 { get; set; }
        public double Pevc1_09 { get; set; }
        public double Tevc1_09 { get; set; }
        public double Vb_line1_09 { get; set; }
        public double Vm_line1_09 { get; set; }
        public double Energy_line1_09 { get; set; }
        public double Pevc2_09 { get; set; }
        public double Tevc2_09 { get; set; }
        public double Vb_line2_09 { get; set; }
        public double Vm_line2_09 { get; set; }
        public double Energy_line2_09 { get; set; }
        //10h
        public double Time10 { get; set; }
        public double Pevc1_10 { get; set; }
        public double Tevc1_10 { get; set; }
        public double Vb_line1_10 { get; set; }
        public double Vm_line1_10 { get; set; }
        public double Energy_line1_10 { get; set; }
        public double Pevc2_10 { get; set; }
        public double Tevc2_10 { get; set; }
        public double Vb_line2_10 { get; set; }
        public double Vm_line2_10 { get; set; }
        public double Energy_line2_10 { get; set; }
        //11h
        public double Time11 { get; set; }
        public double Pevc1_11 { get; set; }
        public double Tevc1_11 { get; set; }
        public double Vb_line1_11 { get; set; }
        public double Vm_line1_11 { get; set; }
        public double Energy_line1_11 { get; set; }
        public double Pevc2_11 { get; set; }
        public double Tevc2_11 { get; set; }
        public double Vb_line2_11 { get; set; }
        public double Vm_line2_11 { get; set; }
        public double Energy_line2_11 { get; set; }
        //12h
        public double Time12 { get; set; }
        public double Pevc1_12 { get; set; }
        public double Tevc1_12 { get; set; }
        public double Vb_line1_12 { get; set; }
        public double Vm_line1_12 { get; set; }
        public double Energy_line1_12 { get; set; }
        public double Pevc2_12 { get; set; }
        public double Tevc2_12 { get; set; }
        public double Vb_line2_12 { get; set; }
        public double Vm_line2_12 { get; set; }
        public double Energy_line2_12 { get; set; }
        //13h
        public double Time13 { get; set; }
        public double Pevc1_13 { get; set; }
        public double Tevc1_13 { get; set; }
        public double Vb_line1_13 { get; set; }
        public double Vm_line1_13 { get; set; }
        public double Energy_line1_13 { get; set; }
        public double Pevc2_13 { get; set; }
        public double Tevc2_13 { get; set; }
        public double Vb_line2_13 { get; set; }
        public double Vm_line2_13 { get; set; }
        public double Energy_line2_13 { get; set; }
        //14h
        public double Time14 { get; set; }
        public double Pevc1_14 { get; set; }
        public double Tevc1_14 { get; set; }
        public double Vb_line1_14 { get; set; }
        public double Vm_line1_14 { get; set; }
        public double Energy_line1_14 { get; set; }
        public double Pevc2_14 { get; set; }
        public double Tevc2_14 { get; set; }
        public double Vb_line2_14 { get; set; }
        public double Vm_line2_14 { get; set; }
        public double Energy_line2_14 { get; set; }
        //15h
        public double Time15 { get; set; }
        public double Pevc1_15 { get; set; }
        public double Tevc1_15 { get; set; }
        public double Vb_line1_15 { get; set; }
        public double Vm_line1_15 { get; set; }
        public double Energy_line1_15 { get; set; }
        public double Pevc2_15 { get; set; }
        public double Tevc2_15 { get; set; }
        public double Vb_line2_15 { get; set; }
        public double Vm_line2_15 { get; set; }
        public double Energy_line2_15 { get; set; }
        //16h
        public double Time16 { get; set; }
        public double Pevc1_16 { get; set; }
        public double Tevc1_16 { get; set; }
        public double Vb_line1_16 { get; set; }
        public double Vm_line1_16 { get; set; }
        public double Energy_line1_16 { get; set; }
        public double Pevc2_16 { get; set; }
        public double Tevc2_16 { get; set; }
        public double Vb_line2_16 { get; set; }
        public double Vm_line2_16 { get; set; }
        public double Energy_line2_16 { get; set; }
        //17h
        public double Time17 { get; set; }
        public double Pevc1_17 { get; set; }
        public double Tevc1_17 { get; set; }
        public double Vb_line1_17 { get; set; }
        public double Vm_line1_17 { get; set; }
        public double Energy_line1_17 { get; set; }
        public double Pevc2_17 { get; set; }
        public double Tevc2_17 { get; set; }
        public double Vb_line2_17 { get; set; }
        public double Vm_line2_17 { get; set; }
        public double Energy_line2_17 { get; set; }
        //18h
        public double Time18 { get; set; }
        public double Pevc1_18 { get; set; }
        public double Tevc1_18 { get; set; }
        public double Vb_line1_18 { get; set; }
        public double Vm_line1_18 { get; set; }
        public double Energy_line1_18 { get; set; }
        public double Pevc2_18 { get; set; }
        public double Tevc2_18 { get; set; }
        public double Vb_line2_18 { get; set; }
        public double Vm_line2_18 { get; set; }
        public double Energy_line2_18 { get; set; }
        //19h
        public double Time19 { get; set; }
        public double Pevc1_19 { get; set; }
        public double Tevc1_19 { get; set; }
        public double Vb_line1_19 { get; set; }
        public double Vm_line1_19 { get; set; }
        public double Energy_line1_19 { get; set; }
        public double Pevc2_19 { get; set; }
        public double Tevc2_19 { get; set; }
        public double Vb_line2_19 { get; set; }
        public double Vm_line2_19 { get; set; }
        public double Energy_line2_19 { get; set; }
        //20h
        public double Time20 { get; set; }
        public double Pevc1_20 { get; set; }
        public double Tevc1_20 { get; set; }
        public double Vb_line1_20 { get; set; }
        public double Vm_line1_20 { get; set; }
        public double Energy_line1_20 { get; set; }
        public double Pevc2_20 { get; set; }
        public double Tevc2_20 { get; set; }
        public double Vb_line2_20 { get; set; }
        public double Vm_line2_20 { get; set; }
        public double Energy_line2_20 { get; set; }
        //21h
        public double Time21 { get; set; }
        public double Pevc1_21 { get; set; }
        public double Tevc1_21 { get; set; }
        public double Vb_line1_21 { get; set; }
        public double Vm_line1_21 { get; set; }
        public double Energy_line1_21 { get; set; }
        public double Pevc2_21 { get; set; }
        public double Tevc2_21 { get; set; }
        public double Vb_line2_21 { get; set; }
        public double Vm_line2_21 { get; set; }
        public double Energy_line2_21 { get; set; }
        //22h
        public double Time22 { get; set; }
        public double Pevc1_22 { get; set; }
        public double Tevc1_22 { get; set; }
        public double Vb_line1_22 { get; set; }
        public double Vm_line1_22 { get; set; }
        public double Energy_line1_22 { get; set; }
        public double Pevc2_22 { get; set; }
        public double Tevc2_22 { get; set; }
        public double Vb_line2_22 { get; set; }
        public double Vm_line2_22 { get; set; }
        public double Energy_line2_22 { get; set; }
        //23h
        public double Time23 { get; set; }
        public double Pevc1_23 { get; set; }
        public double Tevc1_23 { get; set; }
        public double Vb_line1_23 { get; set; }
        public double Vm_line1_23 { get; set; }
        public double Energy_line1_23 { get; set; }
        public double Pevc2_23 { get; set; }
        public double Tevc2_23 { get; set; }
        public double Vb_line2_23 { get; set; }
        public double Vm_line2_23 { get; set; }
        public double Energy_line2_23 { get; set; }
        // 24h
        public double Time24 { get; set; }
        public double Pevc1_24 { get; set; }
        public double Tevc1_24 { get; set; }
        public double Vb_line1_24 { get; set; }
        public double Vm_line1_24 { get; set; }
        public double Energy_line1_24 { get; set; }
        public double Pevc2_24 { get; set; }
        public double Tevc2_24 { get; set; }
        public double Vb_line2_24 { get; set; }
        public double Vm_line2_24 { get; set; }
        public double Energy_line2_24 { get; set; }
        
    }
}
