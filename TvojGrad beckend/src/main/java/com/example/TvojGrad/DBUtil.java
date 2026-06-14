package com.example.TvojGrad;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.ResultSet;
import java.sql.Statement;

public class DBUtil {
    private static boolean schemaChecked = false;

    public static Connection open() throws SQLException {
        String url = "jdbc:mysql://localhost:3306/tvojgrad?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
        String username = "root";
        String password = "lazar2004";

        Connection conn = DriverManager.getConnection(url, username, password);
        ensureSchema(conn);
        return conn;
    }

    private static synchronized void ensureSchema(Connection conn) {
        if (schemaChecked) return;
        try {
            addColumnIfMissing(conn, "korisnik", "Status",
                    "ALTER TABLE korisnik ADD COLUMN Status ENUM('aktivan','na_cekanju_organizator','odbijen_organizator') NOT NULL DEFAULT 'aktivan'");
            executeQuietly(conn, "ALTER TABLE korisnik MODIFY COLUMN Status ENUM('aktivan','na_cekanju_admin','odbijen_admin','na_cekanju_organizator','odbijen_organizator') NOT NULL DEFAULT 'aktivan'");
            executeQuietly(conn, "UPDATE korisnik SET Status='na_cekanju_organizator' WHERE Status='na_cekanju_admin'");
            executeQuietly(conn, "UPDATE korisnik SET Status='odbijen_organizator' WHERE Status='odbijen_admin'");
            executeQuietly(conn, "ALTER TABLE korisnik MODIFY COLUMN Status ENUM('aktivan','na_cekanju_organizator','odbijen_organizator') NOT NULL DEFAULT 'aktivan'");
            executeQuietly(conn, "ALTER TABLE korisnik MODIFY Profilna TEXT NULL");
            addColumnIfMissing(conn, "objava", "Cijena",
                    "ALTER TABLE objava ADD COLUMN Cijena DECIMAL(10,2) NULL");
            addColumnIfMissing(conn, "objava", "Latitude",
                    "ALTER TABLE objava ADD COLUMN Latitude DECIMAL(10,7) NULL");
            addColumnIfMissing(conn, "objava", "Longitude",
                    "ALTER TABLE objava ADD COLUMN Longitude DECIMAL(10,7) NULL");
            alignObjavaTipForeignKey(conn);
            executeQuietly(conn, "ALTER TABLE objava MODIFY COLUMN slika_1 TEXT NULL");
            executeQuietly(conn, "ALTER TABLE objava MODIFY COLUMN Status ENUM('na_cekanju','odobrena','odbijena','arhivirana','promovisana','na_cekanju_promovisana') DEFAULT 'na_cekanju'");
        } finally {
            schemaChecked = true;
        }
    }

    private static void addColumnIfMissing(Connection conn, String tableName, String columnName, String sql) {
        try {
            DatabaseMetaData meta = conn.getMetaData();
            try (ResultSet rs = meta.getColumns(conn.getCatalog(), null, tableName, columnName)) {
                if (rs.next()) return;
            }
            executeQuietly(conn, sql);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    private static void executeQuietly(Connection conn, String sql) {
        try (Statement st = conn.createStatement()) {
            st.execute(sql);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    private static void alignObjavaTipForeignKey(Connection conn) {
        executeQuietly(conn, "ALTER TABLE objava DROP FOREIGN KEY objava_ibfk_4");
        executeQuietly(conn, "ALTER TABLE tip MODIFY COLUMN Naziv varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL");
        executeQuietly(conn, "ALTER TABLE objava MODIFY COLUMN Tip_dogadjaja varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL");
        executeQuietly(conn, "ALTER TABLE objava ADD CONSTRAINT objava_ibfk_4 FOREIGN KEY (Tip_dogadjaja) REFERENCES tip (Naziv)");
    }
}
