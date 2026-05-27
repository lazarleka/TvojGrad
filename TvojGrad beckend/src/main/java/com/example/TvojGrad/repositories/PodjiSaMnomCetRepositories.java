package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.models.PodjiSaMnomCet;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class PodjiSaMnomCetRepositories {

    // Mapira JOIN rezultat iz baze u Čet objekat sa ugniježđenim pošiljaocem (Korisnikom)
    private PodjiSaMnomCet mapRow(ResultSet rs) throws SQLException {
        Korisnik k = new Korisnik(
                rs.getInt("k_id"),
                rs.getString("Ime"),
                rs.getString("Prezime"),
                rs.getString("Email"),
                rs.getString("Tip"),
                rs.getString("Lozinka"),
                rs.getString("Profilna")
        );

        Korisnik primalac = new Korisnik(
                rs.getInt("p_id"),
                rs.getString("p_Ime"),
                rs.getString("p_Prezime"),
                rs.getString("p_Email"),
                rs.getString("p_Tip"),
                rs.getString("p_Lozinka"),
                rs.getString("p_Profilna")
        );

        PodjiSaMnomCet cet = new PodjiSaMnomCet(
            rs.getInt("c_id"),
            rs.getInt("Prijava_ID"),
            k,
            rs.getInt("Primalac_ID"),
            rs.getDouble("Rejting_1"),
            rs.getDouble("Rejting_2")
        );
        cet.setPrimalac(primalac);
        return cet;
    }

    // SQL upit sa INNER JOIN-om za preuzimanje profila pošiljaoca chata
    private final String BASE_SELECT =
            "SELECT c.ID as c_id, c.Prijava_ID, c.Primalac_ID, c.`Rejting_!` as Rejting_1, c.Rejting_2, " +
                    "k.ID as k_id, k.Ime, k.Prezime, k.Email, k.Tip, k.Lozinka, k.Profilna " +
                    ", p.ID as p_id, p.Ime as p_Ime, p.Prezime as p_Prezime, p.Email as p_Email, p.Tip as p_Tip, p.Lozinka as p_Lozinka, p.Profilna as p_Profilna " +
                    "FROM podji_sa_mnom_cet c " +
                    "INNER JOIN korisnik k ON c.Posiljalac_ID = k.ID " +
                    "INNER JOIN korisnik p ON c.Primalac_ID = p.ID";

    public List<PodjiSaMnomCet> getAllCetovi() {
        Connection conn = null;
        List<PodjiSaMnomCet> result = new ArrayList<>();

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

    public PodjiSaMnomCet getCetById(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(BASE_SELECT + " WHERE c.ID=?");
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

    public List<PodjiSaMnomCet> getCetoviByKorisnik(int korisnikID) {
        Connection conn = null;
        List<PodjiSaMnomCet> result = new ArrayList<>();

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(BASE_SELECT + " WHERE c.Posiljalac_ID=? OR c.Primalac_ID=?");
            ps.setInt(1, korisnikID);
            ps.setInt(2, korisnikID);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) result.add(mapRow(rs));
        } catch (Exception e) {
            System.out.println(e);
            return result;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
        return result;
    }

    public PodjiSaMnomCet getCetByPrijavaIKorisnici(int prijavaID, int posiljalacID, int primalacID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(BASE_SELECT + " WHERE c.Prijava_ID=? AND ((c.Posiljalac_ID=? AND c.Primalac_ID=?) OR (c.Posiljalac_ID=? AND c.Primalac_ID=?))");
            ps.setInt(1, prijavaID);
            ps.setInt(2, posiljalacID);
            ps.setInt(3, primalacID);
            ps.setInt(4, primalacID);
            ps.setInt(5, posiljalacID);
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

    public PodjiSaMnomCet kreirajCet(PodjiSaMnomCet c) {
        Connection conn = null;

        try {
            if (c == null || c.getPrijava_ID() == null || c.getPosiljalac() == null || c.getPosiljalac().getID() == null || c.getPrimalac_ID() == null) {
                return null;
            }
            PodjiSaMnomCet postojeci = getCetByPrijavaIKorisnici(c.getPrijava_ID(), c.getPosiljalac().getID(), c.getPrimalac_ID());
            if (postojeci != null) return postojeci;

            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO podji_sa_mnom_cet (Prijava_ID, Posiljalac_ID, Primalac_ID, `Rejting_!`, Rejting_2) VALUES (?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setObject(1, c.getPrijava_ID());
            ps.setInt(2, c.getPosiljalac().getID()); // Izvlačenje ID-ja iz ugniježđenog objekta korisnika
            ps.setObject(3, c.getPrimalac_ID());
            ps.setObject(4, c.getRejting_1());
            ps.setObject(5, c.getRejting_2());
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) c.setID(rs.getInt(1));
            return c;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public PodjiSaMnomCet azurirajCet(int ID, PodjiSaMnomCet c) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(
                    "UPDATE podji_sa_mnom_cet SET Prijava_ID=?, Posiljalac_ID=?, Primalac_ID=?, `Rejting_!`=?, Rejting_2=? WHERE ID=?");
            ps.setObject(1, c.getPrijava_ID());
            ps.setInt(2, c.getPosiljalac().getID());
            ps.setObject(3, c.getPrimalac_ID());
            ps.setObject(4, c.getRejting_1());
            ps.setObject(5, c.getRejting_2());
            ps.setInt(6, ID);
            ps.executeUpdate();
            return c;
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public void obrisiCet(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("DELETE FROM podji_sa_mnom_cet WHERE ID=?");
            ps.setInt(1, ID);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println(e);
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }
}
