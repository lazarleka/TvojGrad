package com.example.TvojGrad.models;

import java.util.Date;

public class Dogadjaj {


    private int ID;
    private String naslov;
    private String Opis;
    private Date datum;
    private String  vreme;
    private int UpVote;
    private int DownVote;
    private String status;
    private String Grad;
    private int Organizator_ID;
    private int Administrator_ID;
    private int tip_dogadjaja;
    private String slika1;
    private String slika2 ;
    private String slika3;
    private String slika4;
    private String slika5;
    public Date getDatum() {
        return datum;
    }

    public int getID() {
        return ID;
    }

    public String getNaslov() {
        return naslov;
    }

    public String getOpis() {
        return Opis;
    }

    public String getVreme() {
        return vreme;
    }

    public int getUpVote() {
        return UpVote;
    }

    public int getDownVote() {
        return DownVote;
    }

    public String getStatus() {
        return status;
    }

    public String getGrad() {
        return Grad;
    }

    public int getOrganizator_ID() {
        return Organizator_ID;
    }

    public int getAdministrator_ID() {
        return Administrator_ID;
    }

    public int getTip_dogadjaja() {
        return tip_dogadjaja;
    }

    public String getSlika1() {
        return slika1;
    }

    public String getSlika2() {
        return slika2;
    }

    public String getSlika3() {
        return slika3;
    }

    public String getSlika4() {
        return slika4;
    }

    public String getSlika5() {
        return slika5;
    }


    public void setID(int ID) {
        this.ID = ID;
    }

    public void setNaslov(String naslov) {
        this.naslov = naslov;
    }

    public void setOpis(String opis) {
        Opis = opis;
    }

    public void setDatum(Date datum) {
        this.datum = datum;
    }

    public void setVreme(String vreme) {
        this.vreme = vreme;
    }

    public void setUpVote(int upVote) {
        UpVote = upVote;
    }

    public void setDownVote(int downVote) {
        DownVote = downVote;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setGrad(String grad) {
        Grad = grad;
    }

    public void setOrganizator_ID(int organizator_ID) {
        Organizator_ID = organizator_ID;
    }

    public void setAdministrator_ID(int administrator_ID) {
        Administrator_ID = administrator_ID;
    }

    public void setTip_dogadjaja(int tip_dogadjaja) {
        this.tip_dogadjaja = tip_dogadjaja;
    }

    public void setSlika1(String slika1) {
        this.slika1 = slika1;
    }

    public void setSlika5(String slika5) {
        this.slika5 = slika5;
    }

    public void setSlika4(String slika4) {
        this.slika4 = slika4;
    }

    public void setSlika3(String slika3) {
        this.slika3 = slika3;
    }

    public void setSlika2(String slika2) {
        this.slika2 = slika2;
    }

    public Dogadjaj() {
    }

    public Dogadjaj(String slika5, String slika4, String slika3, String slika2, String slika1, int tip_dogadjaja, int administrator_ID, int organizator_ID, String grad, String status, int upVote, int downVote, String vreme, Date datum, String opis, String naslov, int ID) {
        this.slika5 = slika5;
        this.slika4 = slika4;
        this.slika3 = slika3;
        this.slika2 = slika2;
        this.slika1 = slika1;
        this.tip_dogadjaja = tip_dogadjaja;
        Administrator_ID = administrator_ID;
        Organizator_ID = organizator_ID;
        Grad = grad;
        this.status = status;
        UpVote = upVote;
        DownVote = downVote;
        this.vreme = vreme;
        this.datum = datum;
        Opis = opis;
        this.naslov = naslov;
        this.ID = ID;
    }
}
