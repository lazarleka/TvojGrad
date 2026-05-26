package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Tip;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class TipRepositories {

    private Tip mapRow(ResultSet rs) throws SQLException {
        return new Tip(rs.getInt("ID"), rs.getString("Naziv"));
    }

    public List<Tip> getAllTipovi() {
        Connection conn = null;
        List<Tip> result = null;

        try {
            conn = DBUtil.open();
            result = new ArrayList<>();
            ResultSet rs = conn.prepareStatement("SELECT * FROM tip").executeQuery();
            while (rs.next()) result.add(mapRow(rs));
        } catch (Exception e) {
            System.out.println(e);
            result = null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
        return result;
    }

    public Tip getTipById(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("SELECT * FROM tip WHERE ID=?");
            ps.setInt(1, ID);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapRow(rs);
            else return new Tip();
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public Tip kreirajTip(Tip t) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("INSERT INTO tip (Naziv) VALUES (?)", Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, t.getNaziv());
            ps.executeUpdate();
            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) t.setID(rs.getInt(1));
            return t;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public Tip azurirajTip(int ID, Tip t) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("UPDATE tip SET Naziv=? WHERE ID=?");
            ps.setString(1, t.getNaziv());
            ps.setInt(2, ID);
            ps.executeUpdate();
            return t;
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public void obrisiTip(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("DELETE FROM tip WHERE ID=?");
            ps.setInt(1, ID);
            ps.executeUpdate();
            System.out.println("Uspjesno obrisan tip sa ID: " + ID);
        } catch (SQLException e) {
            System.out.println(e);
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }
}