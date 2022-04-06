namespace Backend {
  public class RealtimeEVC {
    public short ID { get; set; }
    public bool SDV { get; set; }
    public bool Horn { get; set; }
    public bool Becorn { get; set; }
    public double GD1 { get; set; }
    public double GD2 { get; set; }
    public double Pout { get; set; }
    public double Vb { get; set; }//108
    public double Vm { get; set; }//106
    public double SVF { get; set; }//122
    public double GVF { get; set; }//120
    public double Pevc { get; set; }//124
    public double Tevc { get; set; }//126
    public double VbToday { get; set; } //112
    public double VmToday { get; set; }//114
    public double VbLast { get; set; }//116
    public double VmLast { get; set; } //118
    public double Qmmax { get; set; } //130
    public double Qmmin { get; set; } //132
    public double Qbmax { get; set; }//134
    public double Qbmin { get; set; }//136
    public double Battery { get; set; } //138
    public double UPS { get; set; }
    public double Vb_02 { get; set; }//108
    public double Vm_02 { get; set; }//106
    public double SVF_02 { get; set; }//122
    public double GVF_02 { get; set; }//120
    public double Pevc_02 { get; set; }//124
    public double Tevc_02 { get; set; }//126
    public double VbToday_02 { get; set; } //112
    public double VmToday_02 { get; set; }//114
    public double VbLast_02 { get; set; }//116
    public double VmLast_02 { get; set; } //118
    public double Qmmax_02 { get; set; } //130
    public double Qmmin_02 { get; set; } //132
    public double Qbmax_02 { get; set; }//134
    public double Qbmin_02 { get; set; }//136
    public double Battery_02 { get; set; }
  }
}
