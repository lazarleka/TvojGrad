package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;

public class Korisnik {

    private Integer id;
    private String ime;
    private String prezime;
    private String email;
    private String tip;
    private String lozinka;
    private String profilna;
    private String status;
    private String oMeni;
    private String interesovanja;
    private String neinteresovanja;
    private String grad;

    public Korisnik() {}

    public Korisnik(Integer id, String ime, String prezime, String email, String tip, String lozinka, String profilna) {
        this(id, ime, prezime, email, tip, lozinka, profilna, "aktivan");
    }

    public Korisnik(Integer id, String ime, String prezime, String email, String tip, String lozinka, String profilna, String status) {
        this.id = id;
        this.ime = ime;
        this.prezime = prezime;
        this.email = email;
        this.tip = tip;
        this.lozinka = lozinka;
        this.profilna = profilna;
        this.status = status;
    }

    // Sa @JsonProperty na geterima tačno kontrolišeš šta ide u JSON, bez dupliranja
    @JsonProperty("ID")
    public Integer getID() { return id; }

    @JsonProperty("Ime")
    public String getIme() { return ime; }

    @JsonProperty("Prezime")
    public String getPrezime() { return prezime; }

    @JsonProperty("Email")
    public String getEmail() { return email; }

    @JsonProperty("Tip")
    public String getTip() { return tip; }

    @JsonProperty("Lozinka")
    public String getLozinka() { return lozinka; }

    @JsonProperty("Profilna")
    public String getProfilna() { return profilna; }

    @JsonProperty("Status")
    public String getStatus() { return status; }

    @JsonProperty("O_meni")
    public String getOMeni() { return oMeni; }

    @JsonProperty("Interesovanja")
    public String getInteresovanja() { return interesovanja; }

    @JsonProperty("Neinteresovanja")
    public String getNeinteresovanja() { return neinteresovanja; }

    @JsonProperty("Grad")
    public String getGrad() { return grad; }

    // Setere ostavi normalne (Jackson će znati kako da ih uveže)
    @JsonProperty("ID")
    @JsonAlias("id")
    public void setID(Integer id) { this.id = id; }

    @JsonProperty("Ime")
    @JsonAlias("ime")
    public void setIme(String ime) { this.ime = ime; }

    @JsonProperty("Prezime")
    @JsonAlias("prezime")
    public void setPrezime(String prezime) { this.prezime = prezime; }

    @JsonProperty("Email")
    @JsonAlias("email")
    public void setEmail(String email) { this.email = email; }

    @JsonProperty("Tip")
    @JsonAlias("tip")
    public void setTip(String tip) { this.tip = tip; }

    @JsonProperty("Lozinka")
    @JsonAlias("lozinka")
    public void setLozinka(String lozinka) { this.lozinka = lozinka; }

    @JsonProperty("Profilna")
    @JsonAlias("profilna")
    public void setProfilna(String profilna) { this.profilna = profilna; }

    @JsonProperty("Status")
    @JsonAlias("status")
    public void setStatus(String status) { this.status = status; }

    @JsonProperty("O_meni")
    @JsonAlias({"oMeni", "o_meni"})
    public void setOMeni(String oMeni) { this.oMeni = oMeni; }

    @JsonProperty("Interesovanja")
    @JsonAlias("interesovanja")
    public void setInteresovanja(String interesovanja) { this.interesovanja = interesovanja; }

    @JsonProperty("Neinteresovanja")
    @JsonAlias("neinteresovanja")
    public void setNeinteresovanja(String neinteresovanja) { this.neinteresovanja = neinteresovanja; }

    @JsonProperty("Grad")
    @JsonAlias("grad")
    public void setGrad(String grad) { this.grad = grad; }
}
