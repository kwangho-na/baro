## mssql 테이블 조회
select * 
FROM
    information_schema.tables
WHERE
    table_schema = 'muknoori' and TABLE_TYPE ='BASE TABLE'
    
    
SELECT
    table_name, column_name, column_comment
FROM
    information_schema.columns
WHERE
    table_schema = 'muknoori' AND table_name = 'muk_sticke_file'    
	
##
node.parseJson(#[
        dsn: muk,
        uid: muknoori,
        pwd: eJwqzkvLCc9OMTJSBAg=,
        port: 23381,
        driver: mysql,
        server: 106.246.249.162,
        dbnm: mysql 
])

db=Baro.db('config')
db.exec("insert into db_info (dsn, driver, server, dbnm, uid, pwd, port) values(#{dsn}, #{driver}, #{server}, #{dbnm}, #{uid}, #{pwd}, #{port})", node)
	
