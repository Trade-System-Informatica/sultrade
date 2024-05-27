<?php

class Database {
	
	private static $_connection;
    
	public function __construct(){
        $this->connection = new mysqli('127.0.0.1', 
                                       'webtrade', 
                                       'T3760S', 
                                       'dbstrade'
                                       );

        $this->connection->query("SET NAMES 'utf8'");
        $this->connection->query('SET character_set_connection=utf8');
        $this->connection->query('SET character_set_client=utf8');
        $this->connection->query('SET character_set_results=utf8');
        if( $this->connection->connect_error ){
            print_r($this->connection);
            die();
        } 
	}

    
    public function closeConection(){
        try {
            $this->connection->close();
            return true;
        } catch(Exception $e) {
            echo('102');
            die();
        }

        return $result;
        
    }

    public function loadMax($table_name){
        $query = "SELECT * FROM " . $table_name . " ORDER BY id DESC LIMIT 1";
        return $this->doQuery($query); 
    }
   
    public function doSelect( $table_name, 
                              $select_data = null, 
                              $select_where = null, 
                              $select_join = null ){

        if( $select_data == null ){
            $select_data = " * ";
        }
        if( $select_where == null ){
            $select_where = "";
        } else {
            $select_where = " WHERE " . $select_where;
        }
        $query  = "SELECT " . $select_data . " FROM " . $table_name. " " . $select_join . $select_where;

        return $this->doQuery($query);
    }
    
    public function doInsert( $table_name, 
                              $cols_insert, 
                              $values_insert ){

        $query  = "INSERT INTO " . $table_name . "( " . $cols_insert . " )". " VALUES (" . $values_insert . ")";

        $this->doQuery($query);

        return $this->doQuery("SELECT * FROM ".$table_name." ORDER BY 1 DESC LIMIT 1");
    }
   
    public function doUpdate( $table_name, 
                              $update, 
                              $update_where){

        if( $update_where == null ){
            return false;
        }
 
        $query  = "UPDATE " . $table_name . " SET " . $update . " WHERE " . $update_where;

        return $this->doQuery($query);
    }
    
    public function doDelete( $table_name, 
                              $delete_where ){

        $query = "DELETE FROM " . $table_name. " WHERE " . $delete_where;

        return $this->doQuery($query);
    }
    
    private function doQuery( $query ){

        $mysqli = $this->connection;

        $result = $mysqli->query($query);
        
        if( $result === TRUE ){
            $return = true;
        } else if( $mysqli->error != NULL ){
            echo($mysqli->error . "\nQuery: " . $query);
            //echo('103');
            die();
        } else {
            $return = array();
            while ($row = $result->fetch_assoc()) {
                $return[] = $row;
            }
        }
        return $return;
    }
}
?>
