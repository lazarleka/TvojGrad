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
                rs.getInt("Organizator_ID"),
                rs.getInt("Administrator_ID"),
                rs.getString("Tip_dogadjaja"),
                rs.getString("slika_1")
        );
    }

    public List<Dogadjaj> getAllDogadjaji() {
        Connection conn = null;
        List<Dogadjaj> result = null;

        try {
            conn = DBUtil.open();
            result = new ArrayList<>();
            String sql = "SELECT * FROM objava WHERE Status!='na_cekanju' and Status!='odbijena' ";
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
            String sql = "SELECT * FROM objava WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ID);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapRow(rs);
            } else {
                return new Dogadjaj();
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

    public Dogadjaj kreirajDogadjaj(Dogadjaj dogadjaj) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "INSERT INTO objava (Naslov, Opis, Datum, Vreme, Upvote, Downvote, Status, Grad, Organizator_ID, Administrator_ID, Tip_dogadjaja, slika_1) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, dogadjaj.getNaslov());
            ps.setString(2, dogadjaj.getOpis());
            ps.setDate(3, dogadjaj.getDatum() != null ? new Date(dogadjaj.getDatum().getTime()) : null);
            ps.setString(4, dogadjaj.getVreme());
            ps.setObject(5, dogadjaj.getUpvote());
            ps.setObject(6, dogadjaj.getDownvote());
            ps.setString(7, dogadjaj.getStatus());
            ps.setString(8, dogadjaj.getGrad());
            ps.setObject(9, dogadjaj.getOrganizator_ID());
            ps.setObject(10, dogadjaj.getAdministrator_ID());
            ps.setString(11, dogadjaj.getTip_dogadjaja());
            ps.setString(12, dogadjaj.getSlika_1());
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) {
                dogadjaj.setID(rs.getInt(1));
            }
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
            String sql = "UPDATE objava SET Naslov=?, Opis=?, Datum=?, Vreme=?, Upvote=?, Downvote=?, Status=?, Grad=?, Organizator_ID=?, Administrator_ID=?, Tip_dogadjaja=?, slika_1=? WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, d.getNaslov());
            ps.setString(2, d.getOpis());
            ps.setDate(3, d.getDatum() != null ? new Date(d.getDatum().getTime()) : null);
            ps.setString(4, d.getVreme());
            ps.setObject(5, d.getUpvote());
            ps.setObject(6, d.getDownvote());
            ps.setString(7, d.getStatus());
            ps.setString(8, d.getGrad());
            ps.setObject(9, d.getOrganizator_ID());
            ps.setObject(10, d.getAdministrator_ID());
            ps.setString(11, d.getTip_dogadjaja());
            ps.setString(12, d.getSlika_1());
            ps.setInt(13, ID);
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
}