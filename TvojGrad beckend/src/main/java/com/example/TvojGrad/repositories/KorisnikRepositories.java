package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Korisnik;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class KorisnikRepositories {

    private Korisnik mapRow(ResultSet rs) throws SQLException {
        Korisnik korisnik = new Korisnik(
                rs.getInt("ID"),
                rs.getString("Ime"),
                rs.getString("Prezime"),
                rs.getString("Email"),
                rs.getString("Tip"),
                rs.getString("Lozinka"),
                rs.getString("Profilna"),
                getOptionalString(rs, "Status", "aktivan")
        );
        korisnik.setOMeni(getOptionalString(rs, "O_meni", ""));
        korisnik.setInteresovanja(getOptionalString(rs, "Interesovanja", ""));
        korisnik.setNeinteresovanja(getOptionalString(rs, "Neinteresovanja", ""));
        korisnik.setGrad(getOptionalString(rs, "Grad", ""));
        return korisnik;
    }

    private String getOptionalString(ResultSet rs, String columnName, String fallback) {
        try {
            String value = rs.getString(columnName);
            return value != null ? value : fallback;
        } catch (SQLException e) {
            return fallback;
        }
    }

    public List<Korisnik> getAllKorisnici() {
        Connection conn = null;
        List<Korisnik> result = null;

        try {
            conn = DBUtil.open();
            result = new ArrayList<>();
            String sql = "SELECT * FROM korisnik";
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                result.add(mapRow(rs));
            }
        } catch (Exception e) {
            System.out.println(e);
            result = null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
        return result;
    }

    public Korisnik getKorisnikById(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "SELECT * FROM korisnik WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ID);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapRow(rs);
            } else {
                return new Korisnik();
            }
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Korisnik kreirajKorisnika(Korisnik k) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "INSERT INTO korisnik (Ime, Prezime, Email, Tip, Lozinka, Profilna, Status) VALUES (?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, k.getIme());
            ps.setString(2, k.getPrezime());
            ps.setString(3, k.getEmail());
            ps.setString(4, k.getTip());
            ps.setString(5, k.getLozinka());
            ps.setString(6, k.getProfilna());
            ps.setString(7, k.getStatus() != null ? k.getStatus() : "aktivan");
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) {
                k.setID(rs.getInt(1));
            }
            return k;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Korisnik azurirajKorisnika(int ID, Korisnik k) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "UPDATE korisnik SET Ime=?, Prezime=?, Email=?, Tip=?, Lozinka=?, Profilna=?, Status=? WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, k.getIme());
            ps.setString(2, k.getPrezime());
            ps.setString(3, k.getEmail());
            ps.setString(4, k.getTip());
            ps.setString(5, k.getLozinka());
            ps.setString(6, k.getProfilna());
            ps.setString(7, k.getStatus() != null ? k.getStatus() : "aktivan");
            ps.setInt(8, ID);
            ps.executeUpdate();
            return k;
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public void obrisiKorisnika(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            conn.setAutoCommit(false);

            obrisiObjaveOrganizatora(conn, ID);
            executeDelete(conn, "DELETE pc FROM poruka_ceta pc JOIN podji_sa_mnom_cet c ON c.ID = pc.Cet_ID WHERE c.Posiljalac_ID=? OR c.Primalac_ID=?", ID);
            executeDelete(conn, "DELETE FROM podji_sa_mnom_cet WHERE Posiljalac_ID=? OR Primalac_ID=?", ID);
            executeDelete(conn, "DELETE FROM podji_sa_mnom_zahtev WHERE PosloZahtev=? OR PrimioZahtev=?", ID);
            executeDelete(conn, "DELETE FROM podji_sa_mnom_prijava WHERE Korisnik_ID=?", ID);
            executeDelete(conn, "DELETE FROM omiljeni_dogadjaji WHERE Korisnik_ID=?", ID);
            executeDelete(conn, "DELETE FROM upvote WHERE ID_Korisnika=?", ID);
            executeDelete(conn, "DELETE FROM downvote WHERE ID_Korisnika=?", ID);
            executeDelete(conn, "UPDATE objava SET Administrator_ID=NULL WHERE Administrator_ID=?", ID);
            executeDelete(conn, "DELETE FROM korisnik WHERE ID=?", ID);

            conn.commit();
            System.out.println("Uspjesno obrisan korisnik sa ID: " + ID);
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { System.out.println(ex); }
            }
            System.out.println(e);
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    private void obrisiObjaveOrganizatora(Connection conn, int korisnikID) throws SQLException {
        List<Integer> objave = new ArrayList<>();
        PreparedStatement select = conn.prepareStatement("SELECT ID FROM objava WHERE Organizator_ID=?");
        select.setInt(1, korisnikID);
        ResultSet rs = select.executeQuery();
        while (rs.next()) {
            objave.add(rs.getInt("ID"));
        }

        for (Integer objavaID : objave) {
            executeDelete(conn,
                    "DELETE pc FROM poruka_ceta pc " +
                            "JOIN podji_sa_mnom_cet c ON c.ID = pc.Cet_ID " +
                            "JOIN podji_sa_mnom_prijava p ON p.ID = c.Prijava_ID " +
                            "WHERE p.Objava_ID=?",
                    objavaID);
            executeDelete(conn,
                    "DELETE c FROM podji_sa_mnom_cet c " +
                            "JOIN podji_sa_mnom_prijava p ON p.ID = c.Prijava_ID " +
                            "WHERE p.Objava_ID=?",
                    objavaID);
            executeDelete(conn, "DELETE FROM podji_sa_mnom_prijava WHERE Objava_ID=?", objavaID);
            executeDelete(conn, "DELETE FROM omiljeni_dogadjaji WHERE Objava_ID=?", objavaID);
            executeDelete(conn, "DELETE FROM upvote WHERE ID_Dogadjaja=?", objavaID);
            executeDelete(conn, "DELETE FROM downvote WHERE ID_Dogadjaja=?", objavaID);
            executeDelete(conn, "DELETE FROM objava WHERE ID=?", objavaID);
        }
    }

    private void executeDelete(Connection conn, String sql, int ID) throws SQLException {
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, ID);
        ps.executeUpdate();
    }

    private void executeDelete(Connection conn, String sql, int firstID, int secondID) throws SQLException {
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, firstID);
        ps.setInt(2, secondID);
        ps.executeUpdate();
    }

    public List<Korisnik> getAdminZahtjevi() {
        return getOrganizatorZahtjevi();
    }

    public List<Korisnik> getOrganizatorZahtjevi() {
        Connection conn = null;
        List<Korisnik> result = new ArrayList<>();

        try {
            conn = DBUtil.open();
            String sql = "SELECT * FROM korisnik WHERE Tip='organizator' AND Status='na_cekanju_organizator'";
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                result.add(mapRow(rs));
            }
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
        return result;
    }

    public Korisnik azurirajAdminStatus(int ID, String status) {
        return azurirajOrganizatorStatus(ID, status);
    }

    public Korisnik azurirajOrganizatorStatus(int ID, String status) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "UPDATE korisnik SET Status=? WHERE ID=? AND Tip='organizator'";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, status);
            ps.setInt(2, ID);
            ps.executeUpdate();
            return getKorisnikById(ID);
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Korisnik arhivirajOrganizatora(int ID) {
        return azurirajOrganizatoraIObjave(ID, "odbijen_organizator", "arhivirana");
    }

    public Korisnik vratiOrganizatora(int ID) {
        return azurirajOrganizatoraIObjave(ID, "aktivan", "na_cekanju");
    }

    private Korisnik azurirajOrganizatoraIObjave(int ID, String statusKorisnika, String statusObjava) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            conn.setAutoCommit(false);

            String korisnikSql = "UPDATE korisnik SET Status=? WHERE ID=? AND Tip='organizator'";
            try (PreparedStatement korisnikPs = conn.prepareStatement(korisnikSql)) {
                korisnikPs.setString(1, statusKorisnika);
                korisnikPs.setInt(2, ID);
                int updatedUsers = korisnikPs.executeUpdate();
                if (updatedUsers == 0) {
                    conn.rollback();
                    return null;
                }
            }

            String objavaSql = "UPDATE objava SET Status=? WHERE Organizator_ID=?";
            try (PreparedStatement objavaPs = conn.prepareStatement(objavaSql)) {
                objavaPs.setString(1, statusObjava);
                objavaPs.setInt(2, ID);
                objavaPs.executeUpdate();
            }

            conn.commit();
            return getKorisnikById(ID);
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); }
                catch (Exception ex) { System.out.println(ex); }
            }
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Korisnik azurirajProfilnu(int ID, String profilna) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "UPDATE korisnik SET Profilna=? WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, profilna);
            ps.setInt(2, ID);
            ps.executeUpdate();
            return getKorisnikById(ID);
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Korisnik azurirajMatchingProfil(int ID, Korisnik k) {
        try (Connection conn = DBUtil.open();
             PreparedStatement ps = conn.prepareStatement(
                     "UPDATE korisnik SET O_meni=?, Interesovanja=?, Neinteresovanja=?, Grad=? WHERE ID=?")) {
            ps.setString(1, k.getOMeni());
            ps.setString(2, k.getInteresovanja());
            ps.setString(3, k.getNeinteresovanja());
            ps.setString(4, k.getGrad());
            ps.setInt(5, ID);
            ps.executeUpdate();
            return getKorisnikById(ID);
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        }
    }
}
