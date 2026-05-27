package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.models.PodjiSaMnomZahtev;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class PodjiSaMnomZahtevRepositories {

    // Pomoćna metoda za mapiranje JOIN rezultata u objekat Zahtjeva sa ugniježđenim Korisnikom
    private PodjiSaMnomZahtev mapRow(ResultSet rs) throws SQLException {
        Korisnik k = new Korisnik(
                rs.getInt("k_id"),
                rs.getString("Ime"),
                rs.getString("Prezime"),
                rs.getString("Email"),
                rs.getString("Tip"),
                rs.getString("Lozinka"),
                rs.getString("Profilna")
        );

        return new PodjiSaMnomZahtev(
                rs.getInt("z_id"),
                rs.getString("status"),
                k,
                rs.getInt("PrimioZahtev")
        );
    }

    // SQL upit koji spaja tabele zahtjeva i korisnika preko ID-ja pošiljaoca
    private final String BASE_SELECT =
            "SELECT z.ID as z_id, z.status, z.PrimioZahtev, " +
                    "k.ID as k_id, k.Ime, k.Prezime, k.Email, k.Tip, k.Lozinka, k.Profilna " +
                    "FROM podji_sa_mnom_zahtev z " +
                    "INNER JOIN korisnik k ON z.PosloZahtev = k.ID";

    public List<PodjiSaMnomZahtev> getAllZahtevi() {
        Connection conn = null;
        List<PodjiSaMnomZahtev> result = new ArrayList<>();

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

    public PodjiSaMnomZahtev getZahtevById(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(BASE_SELECT + " WHERE z.ID=?");
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

    public PodjiSaMnomZahtev getZahtevByKorisnici(int posloZahtevID, int primioZahtevID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(BASE_SELECT + " WHERE z.PosloZahtev=? AND z.PrimioZahtev=?");
            ps.setInt(1, posloZahtevID);
            ps.setInt(2, primioZahtevID);
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

    public PodjiSaMnomZahtev kreirajZahtev(PodjiSaMnomZahtev z) {
        Connection conn = null;

        try {
            if (z == null || z.getPosloZahtev() == null || z.getPosloZahtev().getID() == null || z.getPrimioZahtev() == null) {
                return null;
            }

            PodjiSaMnomZahtev postojeci = getZahtevByKorisnici(z.getPosloZahtev().getID(), z.getPrimioZahtev());
            if (postojeci != null) {
                return postojeci;
            }

            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO podji_sa_mnom_zahtev (status, PosloZahtev, PrimioZahtev) VALUES (?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, z.getStatus());
            ps.setInt(2, z.getPosloZahtev().getID()); // Čitanje ID-ja iz ugniježđenog objekta korisnika
            ps.setObject(3, z.getPrimioZahtev());
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) z.setID(rs.getInt(1));
            return z;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public PodjiSaMnomZahtev azurirajZahtev(int ID, PodjiSaMnomZahtev z) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(
                    "UPDATE podji_sa_mnom_zahtev SET status=?, PosloZahtev=?, PrimioZahtev=? WHERE ID=?");
            ps.setString(1, z.getStatus());
            ps.setInt(2, z.getPosloZahtev().getID());
            ps.setObject(3, z.getPrimioZahtev());
            ps.setInt(4, ID);
            ps.executeUpdate();
            return z;
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public PodjiSaMnomZahtev azurirajStatus(int ID, String status) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("UPDATE podji_sa_mnom_zahtev SET status=? WHERE ID=?");
            ps.setString(1, status);
            ps.setInt(2, ID);
            ps.executeUpdate();
            return getZahtevById(ID);
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public void obrisiZahtev(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("DELETE FROM podji_sa_mnom_zahtev WHERE ID=?");
            ps.setInt(1, ID);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println(e);
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }
}
