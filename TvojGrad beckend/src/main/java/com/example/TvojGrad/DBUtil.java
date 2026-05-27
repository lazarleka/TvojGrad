package com.example.TvojGrad;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBUtil {
    public static Connection open()  {

        try {
// Obrati pažnju na kraj stringa: /tvojgrad
            String url = "jdbc:mysql://localhost:3306/tvojgrad?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";            String username = "root";
            String password = "lazar2004";

            Connection conn = DriverManager.getConnection(url, username, password);
            return conn;
        }
        catch (SQLException ex) {
            System.out.println(ex);
            return null;
        }
    }
}
