package com.example.TvojGrad.repositories;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Dogadjaj;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import  java.util.List;

@Repository
public class DogadjajRepositories {

        public List<Dogadjaj> getAllDogadjaji(){
            Connection conn=null;
            List<Dogadjaj> result=null;



            try {
                conn = DBUtil.open();
                result = new ArrayList<Dogadjaj>();

                String sql="SELECT * FROM objava";
                PreparedStatement ps=conn.prepareStatement(sql);
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
                        result.add(d);

                }
            }
            catch (Exception e){
                System.out.println(e);
                result=null;
            }
            finally {
                if (conn != null) {
                    try {
                        conn.close();
                    }
                    catch (Exception ex){
                        System.out.println(ex);
                    }
                }
            }
            return  result;
        }


        public Dogadjaj getDogadjajById(int ID){
            Connection conn=null;
            Dogadjaj d=null;

            try{

                conn=DBUtil.open();
                String sql="SELECT * FROM objava where ID=?";
                PreparedStatement ps=conn.prepareStatement(sql);
                ps.setInt(1,ID);
                ResultSet rs=ps.executeQuery();

                if(rs.next()){
                     d = new Dogadjaj(
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

                }else{
                    d=new Dogadjaj();
                }


            }catch(SQLException e){
                System.out.println(e);
                return null;


            }
            finally {
                if (conn != null) {
                    try {
                        conn.close();
                    }
                    catch (Exception ex){
                        System.out.println(ex);
                    }
                }
            }
            System.out.println("USAO");
            return  d;


        }
    public Dogadjaj kreirajDogadjaj(Dogadjaj dogadjaj){
        Connection conn = null;

        try {
            conn = DBUtil.open();
            String sql = "INSERT INTO dogadjaj (naslov, Opis, datum, vreme, UpVote, DownVote, status, Grad, Organizator_ID, Administrator_ID, tip_dogadjaja, slika1, slika2, slika3, slika4, slika5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql);

            ps.setString(1, dogadjaj.getNaslov());
            ps.setString(2, dogadjaj.getOpis());
            ps.setDate(3, (Date) dogadjaj.getDatum());
            ps.setString(4, dogadjaj.getVreme());
            ps.setInt(5, dogadjaj.getUpVote());
            ps.setInt(6, dogadjaj.getDownVote());
            ps.setString(7, dogadjaj.getStatus());
            ps.setString(8, dogadjaj.getGrad());
            ps.setInt(9, dogadjaj.getOrganizator_ID());
            ps.setInt(10, dogadjaj.getAdministrator_ID());
            ps.setInt(11, dogadjaj.getTip_dogadjaja());
            ps.setString(12, dogadjaj.getSlika1());
            ps.setString(13, dogadjaj.getSlika2());
            ps.setString(14, dogadjaj.getSlika3());
            ps.setString(15, dogadjaj.getSlika4());
            ps.setString(16, dogadjaj.getSlika5());

            ps.executeUpdate();
            return dogadjaj;
        }
        catch (Exception e){
            System.out.println(e);
            return null;
        }
        finally {
            if (conn != null) {
                try {
                    conn.close();
                }
                catch (Exception ex){
                    System.out.println(ex);
                }
            }
        }
    }


    public Dogadjaj azurirajDogadjaj(int ID,Dogadjaj d){
            Connection conn=null;
            try{
                conn=DBUtil.open();
                String sql = "UPDATE dogadjaj SET Naslov=?, Opis=?, Datum=?, Vreme=?, UpVote=?, DownVote=?, Status=?, Grad=?, Organizator_ID=?, Administrator_ID=?, tip_dogadjaja=?, slika1=?, slika2=?, slika3=?, slika4=?, slika5=? WHERE ID=?";
                PreparedStatement ps=conn.prepareStatement(sql);
                ps.setString(1, d.getNaslov());
                ps.setString(2, d.getOpis());
                ps.setDate(3, (Date) d.getDatum());
                ps.setString(4, d.getVreme());
                ps.setInt(5, d.getUpVote());
                ps.setInt(6, d.getDownVote());
                ps.setString(7, d.getStatus());
                ps.setString(8, d.getGrad());
                ps.setInt(9, d.getOrganizator_ID());
                ps.setInt(10, d.getAdministrator_ID());
                ps.setInt(11, d.getTip_dogadjaja());
                ps.setString(12, d.getSlika1());
                ps.setString(13, d.getSlika2());
                ps.setString(14, d.getSlika3());
                ps.setString(15, d.getSlika4());
                ps.setString(16, d.getSlika5());
                ps.setInt(17, ID);
                ps.executeUpdate();

            }catch (SQLException s){
                System.out.println(s);
                return  null;

            }
            finally {
                if (conn != null) {
                    try {
                        conn.close();
                    }
                    catch (Exception ex){
                        System.out.println(ex);
                    }
                }
            }
             return d;


    }

    public void ObrisiDogadjaj(int ID){
            Connection conn=null;
            try{
                conn=DBUtil.open();
                String sql="DELETE FROM objava WHERE ID=?";
                PreparedStatement ps=conn.prepareStatement(sql);
                ps.setInt(1,ID);
                ps.executeUpdate();
                System.out.print("Uspjesno obrisana objava sa idejem ");
                System.out.println(ID);
                System.out.println();

            }catch (SQLException s){
                System.out.println(s);

            }
            finally {
                if (conn != null) {
                    try {
                        conn.close();
                    }
                    catch (Exception ex){
                        System.out.println(ex);
                    }
                }
            }
    }


}
