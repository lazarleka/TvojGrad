package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.models.PodjiSaMnomPrijava;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class PodjiSaMnomPrijavaRepositories {

    // Pomoćna metoda koja mapira i Prijavu i Korisnika iz JOIN upita
    private PodjiSaMnomPrijava mapRow(ResultSet rs) throws SQLException {
        Korisnik k = new Korisnik(
                rs.getInt("k_id"),
                rs.getString("Ime"),
                rs.getString("Prezime"),
                rs.getString("Email"),
                rs.getString("Tip"),
                rs.getString("Lozinka"),
                rs.getString("Profilna")
        );
        k.setOMeni(rs.getString("O_meni"));
        k.setInteresovanja(rs.getString("Interesovanja"));
        k.setNeinteresovanja(rs.getString("Neinteresovanja"));
        k.setGrad(rs.getString("Korisnik_Grad"));

        return new PodjiSaMnomPrijava(
                rs.getInt("p_id"),
                rs.getString("Tekst"),
                rs.getString("Status"),
                k,
                rs.getInt("Objava_ID"),
                rs.getString("Objava_Naslov")
        );
    }

    // Bazni SQL upit koji radi JOIN da povuče i korisnika odmah
    private final String BASE_SELECT =
            "SELECT p.ID as p_id, p.Tekst, p.Status, p.Objava_ID, o.Naslov AS Objava_Naslov, " +
                    "k.ID as k_id, k.Ime, k.Prezime, k.Email, k.Tip, k.Lozinka, k.Profilna, " +
                    "k.O_meni, k.Interesovanja, k.Neinteresovanja, k.Grad AS Korisnik_Grad " +
                    "FROM podji_sa_mnom_prijava p " +
                    "INNER JOIN korisnik k ON p.Korisnik_ID = k.ID " +
                    "LEFT JOIN objava o ON p.Objava_ID = o.ID";

    public List<PodjiSaMnomPrijava> getAllPrijave() {
        Connection conn = null;
        List<PodjiSaMnomPrijava> result = new ArrayList<>();

        try {
            conn = DBUtil.open();
            ResultSet rs = conn.prepareStatement(BASE_SELECT).executeQuery();
            while (rs.next()) result.add(mapRow(rs));
        } catch (Exception e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
        return result;
    }

    public PodjiSaMnomPrijava getPrijavaById(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(BASE_SELECT + " WHERE p.ID=?");
            ps.setInt(1, ID);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapRow(rs);
            else return null;
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    // Vraća sve prijave gdje je ID objave jednak proslijeđenom ObjavaID
    public List<PodjiSaMnomPrijava> getPrijaveByObjava(int ObjavaID) {
        Connection conn = null;
        List<PodjiSaMnomPrijava> result = new ArrayList<>();

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(BASE_SELECT + " WHERE p.Objava_ID=?");
            ps.setInt(1, ObjavaID);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) result.add(mapRow(rs));
        } catch (Exception e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
        return result;
    }

    public PodjiSaMnomPrijava kreirajPrijavu(PodjiSaMnomPrijava p) {
        if (p == null || p.getKorisnik() == null || p.getKorisnik().getID() == null || p.getObjava_ID() == null) {
            return null;
        }
        return kreirajPrijavu(p.getTekst(), p.getStatus(), p.getKorisnik().getID(), p.getObjava_ID());
    }

    public PodjiSaMnomPrijava kreirajPrijavu(String tekst, String status, int korisnikID, int objavaID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO podji_sa_mnom_prijava (Tekst, Status, Korisnik_ID, Objava_ID) VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, tekst);
            ps.setString(2, normalizeStatus(status));
            ps.setInt(3, korisnikID);
            ps.setInt(4, objavaID);
            ps.executeUpdate();

            PodjiSaMnomPrijava p = new PodjiSaMnomPrijava();
            p.setTekst(tekst);
            p.setStatus(normalizeStatus(status));
            p.setObjava_ID(objavaID);
            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) p.setID(rs.getInt(1));
            return p;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public PodjiSaMnomPrijava azurirajPrijavu(int ID, PodjiSaMnomPrijava p) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(
                    "UPDATE podji_sa_mnom_prijava SET Tekst=?, Status=?, Korisnik_ID=?, Objava_ID=? WHERE ID=?");
            ps.setString(1, p.getTekst());
            ps.setString(2, p.getStatus());
            ps.setInt(3, p.getKorisnik().getID());
            ps.setObject(4, p.getObjava_ID());
            ps.setInt(5, ID);
            ps.executeUpdate();
            return p;
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public PodjiSaMnomPrijava azurirajStatus(int ID, String status) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("UPDATE podji_sa_mnom_prijava SET Status=? WHERE ID=?");
            ps.setString(1, normalizeStatus(status));
            ps.setInt(2, ID);
            ps.executeUpdate();
            return getPrijavaById(ID);
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return "Otvoren";
        String value = status.trim().toLowerCase();
        if (value.startsWith("zatvor")) return "Zatvoren";
        if (value.startsWith("otkaz")) return "Otkazan";
        return "Otvoren";
    }

    public boolean obrisiPrijavu(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            conn.setAutoCommit(false);
            PreparedStatement deleteMessages = conn.prepareStatement(
                    "DELETE pc FROM poruka_ceta pc " +
                            "JOIN podji_sa_mnom_cet c ON c.ID = pc.Cet_ID " +
                            "WHERE c.Prijava_ID=?");
            deleteMessages.setInt(1, ID);
            deleteMessages.executeUpdate();

            PreparedStatement deleteChats = conn.prepareStatement("DELETE FROM podji_sa_mnom_cet WHERE Prijava_ID=?");
            deleteChats.setInt(1, ID);
            deleteChats.executeUpdate();

            PreparedStatement ps = conn.prepareStatement("DELETE FROM podji_sa_mnom_prijava WHERE ID=?");
            ps.setInt(1, ID);
            int deleted = ps.executeUpdate();
            conn.commit();
            return deleted > 0;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { System.out.println(ex); }
            }
            System.out.println(e);
            return false;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (Exception ex) { System.out.println(ex); }
            }
        }
    }
}
