package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.models.PorukaCeta;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class PorukaCetaRepository {

    private final String BASE_SELECT =
            "SELECT pc.ID, pc.Cet_ID, pc.Posiljalac_ID, pc.Tekst, pc.Vrijeme, " +
                    "k.ID as k_id, k.Ime, k.Prezime, k.Email, k.Tip, k.Lozinka, k.Profilna " +
                    "FROM poruka_ceta pc " +
                    "INNER JOIN korisnik k ON pc.Posiljalac_ID = k.ID";

    private PorukaCeta mapRow(ResultSet rs) throws SQLException {
        PorukaCeta poruka = new PorukaCeta(
                rs.getInt("ID"),
                rs.getInt("Cet_ID"),
                rs.getInt("Posiljalac_ID"),
                rs.getString("Tekst"),
                rs.getString("Vrijeme")
        );
        poruka.setPosiljalac(new Korisnik(
                rs.getInt("k_id"),
                rs.getString("Ime"),
                rs.getString("Prezime"),
                rs.getString("Email"),
                rs.getString("Tip"),
                rs.getString("Lozinka"),
                rs.getString("Profilna")
        ));
        return poruka;
    }

    public List<PorukaCeta> getPorukeByCet(int cetID) {
        Connection conn = null;
        List<PorukaCeta> poruke = new ArrayList<>();

        try {
            conn = DBUtil.open();
            PreparedStatement ps = conn.prepareStatement(BASE_SELECT + " WHERE pc.Cet_ID=? ORDER BY pc.Vrijeme ASC, pc.ID ASC");
            ps.setInt(1, cetID);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) poruke.add(mapRow(rs));
            return poruke;
        } catch (Exception e) {
            System.out.println("Greska pri citanju poruka: " + e);
            return poruke;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) {} }
        }
    }

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
            PreparedStatement refresh = conn.prepareStatement(BASE_SELECT + " WHERE pc.ID=?");
            refresh.setInt(1, p.getID());
            ResultSet saved = refresh.executeQuery();
            if (saved.next()) return mapRow(saved);
            return p;
        } catch (Exception e) {
            System.out.println("Greška pri upisu poruke: " + e);
            return null;
        } finally {
            if (conn != null) { try { conn.close(); } catch (Exception ex) {} }
        }
    }
}
