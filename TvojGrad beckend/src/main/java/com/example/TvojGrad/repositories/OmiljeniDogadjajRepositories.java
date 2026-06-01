package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Dogadjaj;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class OmiljeniDogadjajRepositories {

    public List<Dogadjaj> GetAllOmiljeniDogadjaj(int KorisnikID) {
        Connection conn = null;
        List<Dogadjaj> res = null;

        try {
            conn = DBUtil.open();
            res = new ArrayList<>();

            String sql = "SELECT o.* FROM omiljeni_dogadjaji od INNER JOIN objava o ON od.Objava_ID = o.ID WHERE od.Korisnik_ID = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, KorisnikID);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Dogadjaj d = new Dogadjaj(
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
                        rs.getInt("Administrator_ID"),
                        rs.getString("Tip_dogadjaja"),
                        rs.getString("slika_1"),
                        rs.getString("Emoji"),
                        rs.getObject("Cijena") != null ? rs.getDouble("Cijena") : null // Dodato čitanje cijene (podržava NULL)
                );
                res.add(d);
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
        return res;
    }

    public void DodajOmiljeniDogadjaj(int KorisnikID, int DogadjajID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "INSERT INTO omiljeni_dogadjaji (Korisnik_ID, Objava_ID) VALUES (?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, KorisnikID);
            ps.setInt(2, DogadjajID);
            ps.executeUpdate();
            System.out.println("Uspjesno dodat omiljeni dogadjaj");
        } catch (SQLException e) {
            System.out.println(e);
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }

    private String getOptionalString(ResultSet rs, String columnName, String fallback) {
        try {
            String value = rs.getString(columnName);
            return value != null ? value : fallback;
        } catch (SQLException e) {
            return fallback;
        }
    }

    public void ObrisiOmiljeniDogadjaj(int KorisnikID, int DogadjajID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "DELETE FROM omiljeni_dogadjaji WHERE Korisnik_ID = ? AND Objava_ID = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, KorisnikID);
            ps.setInt(2, DogadjajID);
            ps.executeUpdate();
            System.out.println("Uspjesno obrisan omiljeni dogadjaj");
        } catch (SQLException e) {
            System.out.println(e);
        } finally {
            if (conn != null) {
                try { conn.close(); }
                catch (Exception ex) { System.out.println(ex); }
            }
        }
    }
}
