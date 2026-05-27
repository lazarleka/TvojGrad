package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.PorukaCeta;
import org.springframework.stereotype.Repository;
import java.sql.*;

@Repository
public class PorukaCetaRepository {

    public PorukaCeta sacuvajPoruku(PorukaCeta p) {
        Connection conn = null;
        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO poruka_ceta (Cet_ID, Posiljalac_ID, Tekst) VALUES (?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, p.getCetID());
            ps.setInt(2, p.getPosiljalacID());
            ps.setString(3, p.getTekst());
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) p.setID(rs.getInt(1));
            return p;
        } catch (Exception e) {
            System.out.println("Greška pri upisu poruke: " + e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) {} }
        }
    }
}