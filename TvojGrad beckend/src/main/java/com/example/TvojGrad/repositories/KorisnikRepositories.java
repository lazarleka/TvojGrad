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
        return new Korisnik(
                rs.getInt("ID"),
                rs.getString("Ime"),
                rs.getString("Prezime"),
                rs.getString("Email"),
                rs.getString("Tip"),
                rs.getString("Lozinka"),
                rs.getString("Profilna")
        );
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
            String sql = "INSERT INTO korisnik (Ime, Prezime, Email, Tip, Lozinka, Profilna) VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, k.getIme());
            ps.setString(2, k.getPrezime());
            ps.setString(3, k.getEmail());
            ps.setString(4, k.getTip());
            ps.setString(5, k.getLozinka());
            ps.setString(6, k.getProfilna());
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
            String sql = "UPDATE korisnik SET Ime=?, Prezime=?, Email=?, Tip=?, Lozinka=?, Profilna=? WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, k.getIme());
            ps.setString(2, k.getPrezime());
            ps.setString(3, k.getEmail());
            ps.setString(4, k.getTip());
            ps.setString(5, k.getLozinka());
            ps.setString(6, k.getProfilna());
            ps.setInt(7, ID);
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
            String sql = "DELETE FROM korisnik WHERE ID=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ID);
            ps.executeUpdate();
            System.out.println("Uspjesno obrisan korisnik sa ID: " + ID);
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