package com.example.TvojGrad.models;

public class Korisnik {

    private int id;
    private String ime;
    private String prezime;
    private String email;
    private String tip;
    private String lozinka;
    private String profilna;

    // Defaultni konstruktor
    public Korisnik() {
    }

    // Konstruktor sa svim parametrima
    public Korisnik(int id, String ime, String prezime, String email, String tip, String lozinka, String profilna) {
        this.id = id;
        this.ime = ime;
        this.prezime = prezime;
        this.email = email;
        this.tip = tip;
        this.lozinka = lozinka;
        this.profilna = profilna;
    }

    // GETTERI I SETTERI (Standardni Java format)
    public int getID() { return id; }
    public void setID(int id) { this.id = id; }

    public String getIme() { return ime; }
    public void setIme(String ime) { this.ime = ime; }

    public String getPrezime() { return prezime; }
    public void setPrezime(String prezime) { this.prezime = prezime; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTip() { return tip; }
    public void setTip(String tip) { this.tip = tip; }

    public String getLozinka() { return lozinka; }
    public void setLozinka(String lozinka) { this.lozinka = lozinka; }

    public String getProfilna() { return profilna; }
    public void setProfilna(String profilna) { this.profilna = profilna; }
}