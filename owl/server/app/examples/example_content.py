from textwrap import dedent

ADDRESSES_CSV = dedent(
    """
    Name,Street Address,City,State,Zip Code,Country,Phone Number,Email,Occupation,Company
    John Doe,123 Elm St,Springfield,IL,62704,USA,555-1234,johndoe@example.com,Engineer,Acme Corp
    Jane Smith,456 Oak St,Metropolis,NY,10001,USA,555-5678,janesmith@example.com,Doctor,Health Clinic
    Sam Johnson,789 Pine St,Gotham,CA,90210,USA,555-8765,samjohnson@example.com,Teacher,High School
    Emily Davis,101 Maple St,Star City,TX,73301,USA,555-4321,emilydavis@example.com,Nurse,City Hospital
    Michael Brown,202 Cedar St,Central City,FL,33101,USA,555-6789,michaelbrown@example.com,Lawyer,Legal Firm
    Sarah Wilson,303 Birch St,Coast City,WA,98101,USA,555-9876,sarahwilson@example.com,Scientist,Research Lab
    David Martinez,404 Ash St,Fawcett City,OH,44101,USA,555-3456,davidmartinez@example.com,Artist,Art Studio
    Laura Taylor,505 Cherry St,Keystone City,PA,15201,USA,555-2345,laurataylor@example.com,Chef,Gourmet Restaurant
    Daniel Anderson,606 Walnut St,National City,AZ,85001,USA,555-4567,danielanderson@example.com,Architect,Design Firm
    Emma Thomas,707 Hickory St,Ivy Town,CO,80201,USA,555-7890,emmathomas@example.com,Musician,Music Academy
    Oliver White,808 Fir St,Bludhaven,NJ,07001,USA,555-3210,oliverwhite@example.com,Photographer,Studio Works
    Sophia Harris,909 Poplar St,Smallville,KS,66002,USA,555-6543,sophiaharris@example.com,Dancer,Dance Studio
    Liam Martin,111 Cypress St,Central City,OH,44102,USA,555-7654,liammartin@example.com,Writer,Publishing House
    Isabella Lewis,222 Beech St,Star City,TX,73302,USA,555-0987,isabellalewis@example.com,Designer,Creative Agency
    Mason Lee,333 Spruce St,Springfield,IL,62705,USA,555-5670,masonlee@example.com,Chef,Fine Dine Restaurant
    Mia Walker,444 Pine St,Metropolis,NY,10002,USA,555-8760,miawalker@example.com,Journalist,News Corp
    Ethan Hall,555 Oak St,Gotham,CA,90211,USA,555-1235,ethanhall@example.com,Engineer,Tech Solutions
    Ava Young,666 Maple St,Keystone City,PA,15202,USA,555-6785,avayoung@example.com,Doctor,Medical Center
    Lucas King,777 Cedar St,Coast City,WA,98102,USA,555-4320,lucasking@example.com,Lawyer,Law Firm
    Charlotte Scott,888 Birch St,National City,AZ,85002,USA,555-3450,charlottescott@example.com,Scientist,Research Institute
    Harper Green,999 Ash St,Fawcett City,OH,44103,USA,555-2340,harpergreen@example.com,Artist,Art Gallery
    Jack Baker,101 Elm St,Bludhaven,NJ,07002,USA,555-4560,jackbaker@example.com,Teacher,Primary School
    Amelia Adams,202 Oak St,Smallville,KS,66003,USA,555-7895,ameliaadams@example.com,Photographer,Photo Studio
    Henry Turner,303 Pine St,Springfield,IL,62706,USA,555-6540,henryturner@example.com,Nurse,Community Hospital
    Evelyn Phillips,404 Maple St,Metropolis,NY,10003,USA,555-3215,evelynphillips@example.com,Writer,Literary Agency
    Sebastian Campbell,505 Cedar St,Gotham,CA,90212,USA,555-7650,sebastiancampbell@example.com,Engineer,Engineering Co
    Ella Parker,606 Birch St,Star City,TX,73303,USA,555-0985,ellaparker@example.com,Doctor,Family Clinic
    Matthew Evans,707 Ash St,Keystone City,PA,15203,USA,555-5675,matthewevans@example.com,Designer,Design Studio
    Avery Edwards,808 Elm St,Coast City,WA,98103,USA,555-8765,averyedwards@example.com,Chef,Culinary School
    Scarlett Collins,909 Oak St,National City,AZ,85003,USA,555-1230,scarlettcollins@example.com,Journalist,Daily News
    Alexander Stewart,111 Poplar St,Fawcett City,OH,44104,USA,555-6780,alexanderstewart@example.com,Musician,Symphony Orchestra
    Grace Morris,222 Beech St,Bludhaven,NJ,07003,USA,555-4325,gracemorris@example.com,Dancer,Dance Academy
    Aiden Rodriguez,333 Cypress St,Smallville,KS,66004,USA,555-3455,aidenrodriguez@example.com,Teacher,High Schoolt
"""
)

STATES = [
    {"Abbreviation": "AL", "State": "Alabama"},
    {"Abbreviation": "AK", "State": "Alaska"},
    {"Abbreviation": "AZ", "State": "Arizona"},
    {"Abbreviation": "AR", "State": "Arkansas"},
    {"Abbreviation": "CA", "State": "California"},
    {"Abbreviation": "CO", "State": "Colorado"},
    {"Abbreviation": "CT", "State": "Connecticut"},
    {"Abbreviation": "DE", "State": "Delaware"},
    {"Abbreviation": "FL", "State": "Florida"},
    {"Abbreviation": "GA", "State": "Georgia"},
    {"Abbreviation": "HI", "State": "Hawaii"},
    {"Abbreviation": "ID", "State": "Idaho"},
    {"Abbreviation": "IL", "State": "Illinois"},
    {"Abbreviation": "IN", "State": "Indiana"},
    {"Abbreviation": "IA", "State": "Iowa"},
    {"Abbreviation": "KS", "State": "Kansas"},
    {"Abbreviation": "KY", "State": "Kentucky"},
    {"Abbreviation": "LA", "State": "Louisiana"},
    {"Abbreviation": "ME", "State": "Maine"},
    {"Abbreviation": "MD", "State": "Maryland"},
    {"Abbreviation": "MA", "State": "Massachusetts"},
    {"Abbreviation": "MI", "State": "Michigan"},
    {"Abbreviation": "MN", "State": "Minnesota"},
    {"Abbreviation": "MS", "State": "Mississippi"},
    {"Abbreviation": "MO", "State": "Missouri"},
    {"Abbreviation": "MT", "State": "Montana"},
    {"Abbreviation": "NE", "State": "Nebraska"},
    {"Abbreviation": "NV", "State": "Nevada"},
    {"Abbreviation": "NH", "State": "New Hampshire"},
    {"Abbreviation": "NJ", "State": "New Jersey"},
    {"Abbreviation": "NM", "State": "New Mexico"},
    {"Abbreviation": "NY", "State": "New York"},
    {"Abbreviation": "NC", "State": "North Carolina"},
    {"Abbreviation": "ND", "State": "North Dakota"},
    {"Abbreviation": "OH", "State": "Ohio"},
    {"Abbreviation": "OK", "State": "Oklahoma"},
    {"Abbreviation": "OR", "State": "Oregon"},
    {"Abbreviation": "PA", "State": "Pennsylvania"},
    {"Abbreviation": "RI", "State": "Rhode Island"},
    {"Abbreviation": "SC", "State": "South Carolina"},
    {"Abbreviation": "SD", "State": "South Dakota"},
    {"Abbreviation": "TN", "State": "Tennessee"},
    {"Abbreviation": "TX", "State": "Texas"},
    {"Abbreviation": "UT", "State": "Utah"},
    {"Abbreviation": "VT", "State": "Vermont"},
    {"Abbreviation": "VA", "State": "Virginia"},
    {"Abbreviation": "WA", "State": "Washington"},
    {"Abbreviation": "WV", "State": "West Virginia"},
    {"Abbreviation": "WI", "State": "Wisconsin"},
    {"Abbreviation": "WY", "State": "Wyoming"},
]

BASIC_SCRIPT = dedent(
    """
-- ! If you have multiple statements on the script, you need to select the one to execute.
-- You can render the actual script that is going to be executed by using the "cube" button
-- on top-right
-- You can download the result-set using the download button on the top-right
-- You can use [Ctrl+Enter] shortcut key to execute the script
-- Check duckdb documentation for the available functions and syntax, https://duckdb.org/docs/

-- Simple select statement
select 10 as MY_NUMBER

-- Querying uploaded files
-- {{files}} you can access every data file you've uploaded with '{{files}}/file-name.ext'
-- Currently only below file types are supported:
-- csv (and friends like tsv etc ...), line delimited json, excel family and parquet files.
select * from '{{files}}/example-addresses.csv'

-- Using macros
-- You can use the your custom macros as well as the system macros and variables
-- using {{content}} syntax.
select {{greet('Alice')}} as GREETINGS

-- Read NYC taxi data
select * from
    read_parquet('https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet')
limit 10


-- Extensions
-- Check out duckdb documentation for more details on the extensions.
-- https://duckdb.org/docs/extensions/overview.html
-- Example usage of postgres extension

-- Install "postgres" the extension
install postgres
-- Load the postgres extension
load postgres

-- We use a publicly available postgres instance, see below link.
-- https://rnacentral.org/help/public-database

-- Attach to postgres instance.
ATTACH
    'dbname=pfmegrnargs user=reader password=NWDMCE5xdipIjRrp host=hh-pgsql-public.ebi.ac.uk port=5432'
AS pg (TYPE POSTGRES, READ_ONLY);

-- Show a list of all attached databases
SHOW DATABASES

-- See available tables on the attached database.
select * from pg.information_schema.tables limit 10;

-- Install "excel" extension
install spatial
load spatial

-- Select from the sheet 'states'
select * from st_read('{{files}}/example-states.xls',
  layer = 'states',
  open_options = ['HEADERS=FORCE']
)


-- You can also use other scripts in your scripts directory as datasets.
-- see 'example-model.sql'
-- 'ref' is a system macro and it accepts the name of the script file without '.sql' extension.
select * from {{ref('example-model')}}

-- Using database
-- ^^^ Select the "example" database from the dropdown above ^^^
-- There is already a test table called addresses.
select * from my_addresses

-- Insert example;
insert into my_addresses (name, email, street,city,phone)
values (
    'John Doe','johndoe@example.com','123 Elm St','Springfield','555-1234'
)
-- see the inserted data
select * from my_addresses

-- create a temp table
create table drop_me as select * from my_addresses

-- check the data
select * from drop_me

-- drop it
drop table drop_me

-- ^^^ In-memory ^^^
-- If you don't select any database you can still execute select statements on external resources.
-- But you **can't** create tables
"""
)


REFERENCE_SCRIPT = dedent(
    """
-- This script will be referenced from example.sql
select * from '{{files}}/example-addresses.csv'
"""
)


BASIC_MACROS = """
-- We use jinja to manage macros.
-- See documentation for using jinja https://jinja.palletsprojects.com
-- You can test your macros in this section using the command and render Icon on top right
{% macro greet(name) %}
  'Hello, {{ name }}!'
{% endmacro %}
"""
