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

        public List<Dogadjaj> GetAllOmiljeniDogadjaj(int KorisnikID){
            Connection conn=null;
            List<Dogadjaj> res=null;
            try{
                conn= DBUtil.open();
                res=new  ArrayList<Dogadjaj>();

                String sql="SELECT * FROM omiljeni_dogadjaji od INNER JOIN objava o on od.Objava_ID=o.ID where od.Korisnik_ID= ?";
                PreparedStatement ps=conn.prepareStatement(sql);
                ps.setInt(1,KorisnikID);
                ResultSet rs=ps.executeQuery();
                while(rs.next()){
                    Dogadjaj d = new Dogadjaj(
                            rs.getString("slika5"),
                            rs.getString("slika4"),
                            rs.getString("slika3"),
                            rs.getString("slika2"),
                            rs.getString("slika1"),
                            rs.getInt("tip_dogadjaja"),
                            rs.getInt("Administrator_ID"),
                            rs.getInt("Organizator_ID"),
                            rs.getString("Grad"),
                            rs.getString("status"),
                            rs.getInt("UpVote"),
                            rs.getInt("DownVote"),
                            rs.getString("vreme"),
                            rs.getDate("datum"),
                            rs.getString("Opis"),
                            rs.getString("naslov"),
                            rs.getInt("ID")
                    );
                    res.add(d);
                }




            }catch (SQLException e){
                System.out.println(e);
                return null;
            }finally {
                if (conn != null) {
                    try {
                        conn.close();
                    }
                    catch (Exception ex){
                        System.out.println(ex);
                    }
                }
            }
            return res;
        }




        public void DodajOmiljeniDogadjaj(int KorisnikID,int DogadjajID){
            Connection conn=null;
            try{
                conn=DBUtil.open();
                String sql="INSERT INTO omiljeni_dogadjaji (Korisnik_ID,Objava_ID) VALUES(?,?)";
                PreparedStatement ps=conn.prepareStatement(sql);
                ps.setInt(1,KorisnikID);
                ps.setInt(2,DogadjajID);

                ps.executeQuery();
            }catch (SQLException e){
                System.out.println(e);

            }finally {
                if (conn != null) {
                    try {
                        conn.close();
                    }
                    catch (Exception ex){
                        System.out.println(ex);
                    }
                }
            }
            System.out.println("Uspjesno dodat dogadjaj");
        }


    public void ObrisiOmiljeniDogadjaj(int KorisnikID,int DogadjajID){
        Connection conn=null;
        try{
            conn=DBUtil.open();
            String sql="DELETE  FROM omiljen_dogadjaji WHERE Korisnik_ID=? AND Objava_ID=?";
            PreparedStatement ps=conn.prepareStatement(sql);
            ps.setInt(1,KorisnikID);
            ps.setInt(2,DogadjajID);

            ps.executeQuery();
        }catch (SQLException e){
            System.out.println(e);

        }finally {
            if (conn != null) {
                try {
                    conn.close();
                }
                catch (Exception ex){
                    System.out.println(ex);
                }
            }
        }
        System.out.println("Uspjesno obrisan dogadjaj");
    }






}
