package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Dogadjaj {

    @JsonProperty("ID")
    private Integer ID;

    @JsonProperty("Naslov")
    private String Naslov;

    @JsonProperty("Opis")
    private String Opis;

    @JsonProperty("Datum")
    private String Datum;

    @JsonProperty("Vreme")
    private String Vreme;

    @JsonProperty("Upvote")
    private Integer Upvote;

    @JsonProperty("Downvote")
    private Integer Downvote;

    @JsonProperty("Status")
    private String Status;

    @JsonProperty("Grad")
    private String Grad;

    @JsonProperty("Adresa")
    private String Adresa;

    @JsonProperty("Organizator_ID")
    private Integer Organizator_ID;

    @JsonProperty("Organizator")
    private String Organizator;

    @JsonProperty("Administrator_ID")
    private Integer Administrator_ID;

    @JsonProperty("Tip_dogadjaja")
    private String Tip_dogadjaja;

    @JsonProperty("slika_1")
    private String slika_1;

    @JsonProperty("Emoji")
    private String Emoji;
    @JsonProperty("Cijena")
    private Double Cijena;
    public Dogadjaj() {}

    public Dogadjaj(
            Integer ID,
            String Naslov,
            String Opis,
            String Datum,
            String Vreme,
            Integer Upvote,
            Integer Downvote,
            String Status,
            String Grad,
            String Adresa,
            Integer Organizator_ID,
            Integer Administrator_ID,
            String Tip_dogadjaja,
            String slika_1,
            String Emoji,
            Double Cijena
    ) {
        this(ID, Naslov, Opis, Datum, Vreme, Upvote, Downvote, Status, Grad, Adresa, Organizator_ID,
                null, Administrator_ID, Tip_dogadjaja, slika_1, Emoji, Cijena);
    }

    public Dogadjaj(
            Integer ID,
            String Naslov,
            String Opis,
            String Datum,
            String Vreme,
            Integer Upvote,
            Integer Downvote,
            String Status,
            String Grad,
            String Adresa,
            Integer Organizator_ID,
            String Organizator,
            Integer Administrator_ID,
            String Tip_dogadjaja,
            String slika_1,
            String Emoji,
            Double Cijena
    ) {
        this.ID = ID;
        this.Naslov = Naslov;
        this.Opis = Opis;
        this.Datum = Datum;
        this.Vreme = Vreme;
        this.Upvote = Upvote;
        this.Downvote = Downvote;
        this.Status = Status;
        this.Grad = Grad;
        this.Adresa = Adresa;
        this.Organizator_ID = Organizator_ID;
        this.Organizator = Organizator;
        this.Administrator_ID = Administrator_ID;
        this.Tip_dogadjaja = Tip_dogadjaja;
        this.slika_1 = slika_1;
        this.Emoji = Emoji;
        this.Cijena=Cijena;
    }

    public Integer getID() { return ID; }
    public String getNaslov() { return Naslov; }
    public String getOpis() { return Opis; }
    public String getDatum() { return Datum; }
    public String getVreme() { return Vreme; }
    public Integer getUpvote() { return Upvote; }
    public Integer getDownvote() { return Downvote; }
    public String getStatus() { return Status; }
    public String getGrad() { return Grad; }
    public String getAdresa() { return Adresa; }
    public Integer getOrganizator_ID() { return Organizator_ID; }
    public String getOrganizator() { return Organizator; }
    public Integer getAdministrator_ID() { return Administrator_ID; }
    public String getTip_dogadjaja() { return Tip_dogadjaja; }
    public String getSlika_1() { return slika_1; }
    public String getEmoji() { return Emoji; }
    public Double getCijena(){return Cijena;}

    public void setID(Integer ID) { this.ID = ID; }
    public void setNaslov(String naslov) { this.Naslov = naslov; }
    public void setOpis(String opis) { this.Opis = opis; }
    public void setDatum(String datum) { this.Datum = datum; }
    public void setVreme(String vreme) { this.Vreme = vreme; }
    public void setUpvote(Integer upvote) { this.Upvote = upvote; }
    public void setDownvote(Integer downvote) { this.Downvote = downvote; }
    public void setStatus(String status) { this.Status = status; }
    public void setGrad(String grad) { this.Grad = grad; }
    public void setAdresa(String adresa) { this.Adresa = adresa; }
    public void setOrganizator_ID(Integer organizator_ID) { this.Organizator_ID = organizator_ID; }
    public void setOrganizator(String organizator) { this.Organizator = organizator; }
    public void setAdministrator_ID(Integer administrator_ID) { this.Administrator_ID = administrator_ID; }
    public void setTip_dogadjaja(String tip_dogadjaja) { this.Tip_dogadjaja = tip_dogadjaja; }
    public void setSlika_1(String slika_1) { this.slika_1 = slika_1; }
    public void setEmoji(String emoji) { this.Emoji = emoji; }
    public void setCijena(Double Cijena){this.Cijena=Cijena; }
}
