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

    private Korisnik mapUser(ResultSet rs, String prefix) throws SQLException {
        int id = rs.getInt(prefix + "_id");
        if (rs.wasNull()) return null;
        return new Korisnik(
                id,
                rs.getString(prefix + "_Ime"),
                rs.getString(prefix + "_Prezime"),
                rs.getString(prefix + "_Email"),
                rs.getString(prefix + "_Tip"),
                rs.getString(prefix + "_Lozinka"),
                rs.getString(prefix + "_Profilna")
        );
    }

    private PodjiSaMnomZahtev mapRow(ResultSet rs) throws SQLException {
        return new PodjiSaMnomZahtev(
                rs.getInt("z_id"),
                rs.getString("status"),
                mapUser(rs, "posiljalac"),
                rs.getInt("PrimioZahtev"),
                mapUser(rs, "primalac")
        );
    }

    private final String BASE_SELECT =
            "SELECT z.ID as z_id, z.status, z.PrimioZahtev, " +
                    "posiljalac.ID as posiljalac_id, posiljalac.Ime as posiljalac_Ime, posiljalac.Prezime as posiljalac_Prezime, " +
                    "posiljalac.Email as posiljalac_Email, posiljalac.Tip as posiljalac_Tip, posiljalac.Lozinka as posiljalac_Lozinka, posiljalac.Profilna as posiljalac_Profilna, " +
                    "primalac.ID as primalac_id, primalac.Ime as primalac_Ime, primalac.Prezime as primalac_Prezime, " +
                    "primalac.Email as primalac_Email, primalac.Tip as primalac_Tip, primalac.Lozinka as primalac_Lozinka, primalac.Profilna as primalac_Profilna " +
                    "FROM podji_sa_mnom_zahtev z " +
                    "INNER JOIN korisnik posiljalac ON z.PosloZahtev = posiljalac.ID " +
                    "LEFT JOIN korisnik primalac ON z.PrimioZahtev = primalac.ID";

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
            PreparedStatement ps = conn.prepareStatement(BASE_SELECT + " WHERE (z.PosloZahtev=? AND z.PrimioZahtev=?) OR (z.PosloZahtev=? AND z.PrimioZahtev=?)");
            ps.setInt(1, posloZahtevID);
            ps.setInt(2, primioZahtevID);
            ps.setInt(3, primioZahtevID);
            ps.setInt(4, posloZahtevID);
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

            if (String.valueOf(z.getPosloZahtev().getID()).equals(String.valueOf(z.getPrimioZahtev()))) {
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
            ps.setInt(2, z.getPosloZahtev().getID());
            ps.setObject(3, z.getPrimioZahtev());
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) z.setID(rs.getInt(1));
            return getZahtevById(z.getID());
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
            return getZahtevById(ID);
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
