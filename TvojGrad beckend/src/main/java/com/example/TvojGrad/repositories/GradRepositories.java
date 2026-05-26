package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Grad;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class GradRepositories {

    private Grad mapRow(ResultSet rs) throws SQLException {
        return new Grad(rs.getInt("ID"), rs.getString("Ime"));
    }

    public List<Grad> getAllGradovi() {
        Connection conn = null;
        List<Grad> result = null;

        try {
            conn = DBUtil.open();
            result = new ArrayList<>();
            PreparedStatement ps = conn.prepareStatement("SELECT * FROM grad");
            ResultSet rs = ps.executeQuery();
            while (rs.next()) result.add(mapRow(rs));
        } catch (Exception e) {
            System.out.println(e);
            result = null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
        return result;
    }

    public Grad getGradById(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("SELECT * FROM grad WHERE ID=?");
            ps.setInt(1, ID);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapRow(rs);
            else return new Grad();
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public Grad kreirajGrad(Grad g) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("INSERT INTO grad (Ime) VALUES (?)", Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, g.getIme());
            ps.executeUpdate();
            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) g.setID(rs.getInt(1));
            return g;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public Grad azurirajGrad(int ID, Grad g) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("UPDATE grad SET Ime=? WHERE ID=?");
            ps.setString(1, g.getIme());
            ps.setInt(2, ID);
            ps.executeUpdate();
            return g;
        } catch (SQLException e) {
            System.out.println(e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }

    public void obrisiGrad(int ID) {
        Connection conn = null;

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement("DELETE FROM grad WHERE ID=?");
            ps.setInt(1, ID);
            ps.executeUpdate();
            System.out.println("Uspjesno obrisan grad sa ID: " + ID);
        } catch (SQLException e) {
            System.out.println(e);
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) { System.out.println(ex); } }
        }
    }
}