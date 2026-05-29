package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.models.LoginRequest;
import org.springframework.stereotype.Repository;

import java.sql.*;

@Repository
public class AuthRepositories {

    public Korisnik login(LoginRequest loginRequest) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "SELECT * FROM korisnik WHERE Email=? AND Lozinka=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, loginRequest.getEmail());
            ps.setString(2, loginRequest.getLozinka());
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                String status = getOptionalString(rs, "Status", "aktivan");
                if (status != null && !"aktivan".equals(status)) {
                    return null;
                }
                return new Korisnik(
                        rs.getInt("ID"),
                        rs.getString("Ime"),
                        rs.getString("Prezime"),
                        rs.getString("Email"),
                        rs.getString("Tip"),
                        rs.getString("Lozinka"),
                        rs.getString("Profilna"),
                        status
                );
            } else {
                return null; // pogresan email ili lozinka
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

    public Korisnik register(Korisnik k) {
        Connection conn = null;

        try {
            conn = DBUtil.open();

            // provjeri da li email vec postoji
            String checkSql = "SELECT ID FROM korisnik WHERE Email=?";
            PreparedStatement checkPs = conn.prepareStatement(checkSql);
            checkPs.setString(1, k.getEmail());
            ResultSet checkRs = checkPs.executeQuery();
            if (checkRs.next()) {
                return null; // email vec postoji
            }

            String tip = k.getTip() != null ? k.getTip() : "obicni";
            if ("administrator".equals(tip)) {
                return null;
            }
            String status = "organizator".equals(tip) ? "na_cekanju_organizator" : "aktivan";
            String sql = "INSERT INTO korisnik (Ime, Prezime, Email, Tip, Lozinka, Profilna, Status) VALUES (?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, k.getIme());
            ps.setString(2, k.getPrezime());
            ps.setString(3, k.getEmail());
            ps.setString(4, tip);
            ps.setString(5, k.getLozinka());
            ps.setString(6, k.getProfilna());
            ps.setString(7, status);
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) {
                k.setID(rs.getInt(1));
            }
            k.setTip(tip);
            k.setStatus(status);
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

    private String getOptionalString(ResultSet rs, String columnName, String fallback) {
        try {
            String value = rs.getString(columnName);
            return value != null ? value : fallback;
        } catch (SQLException e) {
            return fallback;
        }
    }
}
