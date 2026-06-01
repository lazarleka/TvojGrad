package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Dogadjaj;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class DogadjajRepositories {

    private Dogadjaj mapRow(ResultSet rs) throws SQLException {
        return new Dogadjaj(
                rs.getInt("ID"),
                rs.getString("Naslov"),
                rs.getString("Opis"),
                rs.getDate("Datum"),
                rs.getString("Vreme"),
                rs.getInt("Upvote"),
                rs.getInt("Downvote"),
                rs.getString("Status"),
                rs.getString("Grad"),
                getOptionalString(rs, "Adresa", null),
                rs.getInt("Organizator_ID"),
                getOptionalString(rs, "Organizator", null),
                rs.getInt("Administrator_ID"),
                rs.getString("Tip_dogadjaja"),
                rs.getString("slika_1"),
                rs.getString("Emoji"),
                rs.getObject("Cijena") != null ? rs.getDouble("Cijena") : null // Dodato čitanje cijene (podržava NULL)
        );
    }

    private String baseSelect() {
        return "SELECT o.*, CONCAT_WS(' ', k.Ime, k.Prezime) AS Organizator FROM objava o LEFT JOIN korisnik k ON k.ID=o.Organizator_ID";
    }

    private String getOptionalString(ResultSet rs, String columnName, String fallback) {
        try {
            String value = rs.getString(columnName);
            return value != null ? value : fallback;
        } catch (SQLException e) {
            return fallback;
        }
    }

    private Dogadjaj getDogadjajById(Connection conn, int ID) throws SQLException {
        String sql = baseSelect() + " WHERE o.ID=?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, ID);
        ResultSet rs = ps.executeQuery();
        return rs.next() ? mapRow(rs) : new Dogadjaj();
    }

    private boolean voteExists(Connection conn, String tableName, int dogadjajID, int korisnikID) throws SQLException {
        String sql = "SELECT 1 FROM " + tableName + " WHERE ID_Dogadjaja=? AND ID_Korisnika=? LIMIT 1";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, dogadjajID);
        ps.setInt(2, korisnikID);
        ResultSet rs = ps.executeQuery();
        return rs.next();
    }

    private void deleteVote(Connection conn, String tableName, int dogadjajID, int korisnikID) throws SQLException {
        String sql = "DELETE FROM " + tableName + " WHERE ID_Dogadjaja=? AND ID_Korisnika=?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, dogadjajID);
        ps.setInt(2, korisnikID);
        ps.executeUpdate();
    }

    private void insertVote(Connection conn, String tableName, int dogadjajID, int korisnikID) throws SQLException {
        String sql = "INSERT INTO " + tableName + " (ID, ID_Dogadjaja, ID_Korisnika) " +
                "SELECT COALESCE(MAX(ID), 0) + 1, ?, ? FROM " + tableName;
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, dogadjajID);
        ps.setInt(2, korisnikID);
        ps.executeUpdate();
    }

    private Dogadjaj syncVoteCounts(Connection conn, int dogadjajID) throws SQLException {
        String sql = "UPDATE objava SET " +
                "Upvote = (SELECT COUNT(*) FROM upvote WHERE ID_Dogadjaja=?), " +
                "Downvote = (SELECT COUNT(*) FROM downvote WHERE ID_Dogadjaja=?) " +
                "WHERE ID=?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, dogadjajID);
        ps.setInt(2, dogadjajID);
        ps.setInt(3, dogadjajID);
        ps.executeUpdate();
        return getDogadjajById(conn, dogadjajID);
    }

    public List<Dogadjaj> getAllDogadjaji() {
        Connection conn = null;
        List<Dogadjaj> result = null;

        try {
            conn = DBUtil.open();
            result = new ArrayList<>();
            // Mala ispravka dupliranog uslova za status u tvom SQL-u
            String sql = baseSelect() + " WHERE o.Status IN ('odobrena','promovisana') ORDER BY o.Datum ASC, o.Vreme ASC";
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

    public Dogadjaj getDogadjajById(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            return getDogadjajById(conn, ID);
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

    public Dogadjaj kreirajDogadjaj(Dogadjaj dogadjaj) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            // Dodata kolona Cijena i još jedan upitnik (?) na kraj
            String sql = "INSERT INTO objava (Naslov, Opis, Datum, Vreme, Upvote, Downvote, Status, Grad, Adresa, Organizator_ID, Administrator_ID, Tip_dogadjaja, slika_1, Emoji, Cijena) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, dogadjaj.getNaslov());
            ps.setString(2, dogadjaj.getOpis());
            ps.setDate(3, dogadjaj.getDatum() != null ? new Date(dogadjaj.getDatum().getTime()) : null);
            ps.setString(4, dogadjaj.getVreme());
            ps.setObject(5, dogadjaj.getUpvote());
            ps.setObject(6, dogadjaj.getDownvote());
            String requestedStatus = dogadjaj.getStatus();
            String status = "na_cekanju_promovisana".equals(requestedStatus) || "promovisana".equals(requestedStatus)
                    ? "na_cekanju_promovisana"
                    : "na_cekanju";
            ps.setString(7, status);
            ps.setString(8, dogadjaj.getGrad());
            ps.setString(9, dogadjaj.getAdresa());
            ps.setObject(10, dogadjaj.getOrganizator_ID());
            ps.setObject(11, dogadjaj.getAdministrator_ID());
            ps.setString(12, dogadjaj.getTip_dogadjaja());
            ps.setString(13, dogadjaj.getSlika_1());
            ps.setString(14, dogadjaj.getEmoji());
            ps.setObject(15, dogadjaj.getCijena());
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) {
                dogadjaj.setID(rs.getInt(1));
            }
            dogadjaj.setStatus(status);
            return dogadjaj;
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

    public Dogadjaj azurirajDogadjaj(int ID, Dogadjaj d) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            // Dodato ažuriranje kolone Cijena=?
            String sql = "UPDATE objava SET Naslov=?, Opis=?, Datum=?, Vreme=?, Upvote=?, Downvote=?, Status=?, Grad=?, Adresa=?, Organizator_ID=?, Administrator_ID=?, Tip_dogadjaja=?, slika_1=?, Emoji=?, Cijena=? WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, d.getNaslov());
            ps.setString(2, d.getOpis());
            ps.setDate(3, d.getDatum() != null ? new Date(d.getDatum().getTime()) : null);
            ps.setString(4, d.getVreme());
            ps.setObject(5, d.getUpvote());
            ps.setObject(6, d.getDownvote());
            ps.setString(7, d.getStatus());
            ps.setString(8, d.getGrad());
            ps.setString(9, d.getAdresa());
            ps.setObject(10, d.getOrganizator_ID());
            ps.setObject(11, d.getAdministrator_ID());
            ps.setString(12, d.getTip_dogadjaja());
            ps.setString(13, d.getSlika_1());
            ps.setString(14, d.getEmoji());
            ps.setObject(15, d.getCijena());
            ps.setInt(16, ID);
            ps.executeUpdate();
            return d;
        } catch (SQLException s) {
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public void ObrisiDogadjaj(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "DELETE FROM objava WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ID);
            ps.executeUpdate();
            System.out.println("Uspjesno obrisana objava sa ID: " + ID);
        } catch (SQLException s) {
            System.out.println(s);
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Dogadjaj upvote(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "UPDATE objava SET Upvote = Upvote + 1 WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ID);
            ps.executeUpdate();
            return getDogadjajById(ID);
        } catch (SQLException s) {
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Dogadjaj downvote(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "UPDATE objava SET Downvote = Downvote + 1 WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ID);
            ps.executeUpdate();
            return getDogadjajById(ID);
        } catch (SQLException s) {
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Dogadjaj removeUpvote(int ID) {
        Connection conn = null;
        try {
            conn = DBUtil.open();
            String sql = "UPDATE objava SET Upvote = GREATEST(Upvote - 1, 0) WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ID);
            ps.executeUpdate();
            return getDogadjajById(ID);
        } catch (SQLException s) {
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public Dogadjaj removeDownvote(int ID) {
        Connection conn = null;
        try {
            conn = DBUtil.open();
            String sql = "UPDATE objava SET Downvote = GREATEST(Downvote - 1, 0) WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ID);
            ps.executeUpdate();
            return getDogadjajById(ID);
        } catch (SQLException s) {
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public Dogadjaj glasaj(int dogadjajID, int korisnikID, String tipGlasa) {
        Connection conn = null;

        String targetTable = "up".equals(tipGlasa) ? "upvote" : "downvote";
        String oppositeTable = "up".equals(tipGlasa) ? "downvote" : "upvote";

        try {
            conn = DBUtil.open();
            conn.setAutoCommit(false);

            deleteVote(conn, oppositeTable, dogadjajID, korisnikID);
            if (!voteExists(conn, targetTable, dogadjajID, korisnikID)) {
                insertVote(conn, targetTable, dogadjajID, korisnikID);
            }

            Dogadjaj updated = syncVoteCounts(conn, dogadjajID);
            conn.commit();
            return updated;
        } catch (SQLException s) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { System.out.println(ex); }
            }
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Dogadjaj ukloniGlas(int dogadjajID, int korisnikID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            conn.setAutoCommit(false);

            deleteVote(conn, "upvote", dogadjajID, korisnikID);
            deleteVote(conn, "downvote", dogadjajID, korisnikID);

            Dogadjaj updated = syncVoteCounts(conn, dogadjajID);
            conn.commit();
            return updated;
        } catch (SQLException s) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { System.out.println(ex); }
            }
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public String getGlas(int dogadjajID, int korisnikID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            if (voteExists(conn, "upvote", dogadjajID, korisnikID)) return "up";
            if (voteExists(conn, "downvote", dogadjajID, korisnikID)) return "down";
            return null;
        } catch (SQLException s) {
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); } catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public List<Dogadjaj> getSviDogadjajiZaAdmin() {
        Connection conn = null;
        List<Dogadjaj> result = new ArrayList<>();

        try {
            conn = DBUtil.open();
            String sql = baseSelect() + " ORDER BY o.ID DESC";
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

    public List<Dogadjaj> getDogadjajiByOrganizator(int organizatorID) {
        Connection conn = null;
        List<Dogadjaj> result = new ArrayList<>();

        try {
            conn = DBUtil.open();
            String sql = baseSelect() + " WHERE o.Organizator_ID=? ORDER BY o.ID DESC";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, organizatorID);
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

    public Dogadjaj promijeniStatus(int ID, String status, Integer administratorID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "UPDATE objava SET Status=?, Administrator_ID=? WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, status);
            ps.setObject(2, administratorID);
            ps.setInt(3, ID);
            ps.executeUpdate();
            return getDogadjajById(conn, ID);
        } catch (SQLException s) {
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Dogadjaj zahtjevZaPromociju(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "UPDATE objava SET Status='na_cekanju_promovisana' WHERE ID=? AND Status='odobrena'";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ID);
            ps.executeUpdate();
            return getDogadjajById(conn, ID);
        } catch (SQLException s) {
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    public Dogadjaj azurirajSliku(int ID, String slika) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "UPDATE objava SET slika_1=? WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, slika);
            ps.setInt(2, ID);
            ps.executeUpdate();
            return getDogadjajById(conn, ID);
        } catch (SQLException s) {
            System.out.println(s);
            return null;
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }
}
