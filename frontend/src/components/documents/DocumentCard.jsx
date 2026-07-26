"use client";

import {
  Visibility,
  Delete,
  Download,
  CalendarMonth,
  Storage,
  PictureAsPdf,
  Image,
  InsertDriveFile,
} from "@mui/icons-material";

import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";


export default function DocumentCard({
  document,
  onView,
  onDelete,
}) {


  const formattedDate = new Date(
    document.created_at
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });



  const fileSize = (
    document.file_size /
    1024 /
    1024
  ).toFixed(2);



  const extension =
    document.file_name
      ?.split(".")
      .pop()
      ?.toLowerCase() || "";



  const getIcon = () => {

    if(extension==="pdf"){

      return (
        <PictureAsPdf
          sx={{
            fontSize:55,
            color:"error.main"
          }}
        />
      );

    }


    if(
      [
        "png",
        "jpg",
        "jpeg",
        "gif",
        "webp"
      ].includes(extension)
    ){

      return (
        <Image
          sx={{
            fontSize:55,
            color:"success.main"
          }}
        />
      );

    }


    return (
      <InsertDriveFile

        sx={{
          fontSize:55,
          color:"primary.main"
        }}

      />
    );

  };




  return (

    <Card

      elevation={2}

      sx={{

        borderRadius:4,

        overflow:"hidden",

        transition:"all 0.3s ease",

        "&:hover":{

          transform:"translateY(-6px)",

          boxShadow:
          "0 12px 30px rgba(0,0,0,0.12)"

        }

      }}

    >


      {/* File Icon Area */}

      <Box

        sx={{

          height:180,

          backgroundColor:
          "grey.100",

          display:"flex",

          alignItems:"center",

          justifyContent:"center"

        }}

      >

        {getIcon()}

      </Box>





      {/* Content */}

      <CardContent

        sx={{

          p:3

        }}

      >


        {/* Title */}


        <Typography

          variant="h6"

          fontWeight={700}

          noWrap

          title={document.file_name}

          sx={{

            mb:1

          }}

        >

          {document.file_name}

        </Typography>





        {/* Category */}


        <Chip

          label={document.category}

          size="small"

          color="primary"

          sx={{

            fontWeight:600,

            mb:3

          }}

        />






        {/* Details */}


        <Stack

          spacing={1.5}

          color="text.secondary"

          fontSize={14}

        >


          <Box

            sx={{

              display:"flex",

              alignItems:"center",

              gap:1

            }}

          >

            <Storage fontSize="small"/>

            <Typography variant="body2">

              {fileSize} MB

            </Typography>


          </Box>





          <Box

            sx={{

              display:"flex",

              alignItems:"center",

              gap:1

            }}

          >

            <CalendarMonth fontSize="small"/>


            <Typography variant="body2">

              {formattedDate}

            </Typography>


          </Box>


        </Stack>







        {/* Actions */}


        <Stack

          direction="row"

          spacing={1.5}

          mt={3}

        >



          <Tooltip title="View">


            <IconButton

              onClick={()=>onView(document.id)}

              sx={{

                flex:1,

                border:1,

                borderColor:"divider",

                borderRadius:2

              }}

            >

              <Visibility/>

            </IconButton>


          </Tooltip>





          <Tooltip title="Download">


            <IconButton

              sx={{

                flex:1,

                border:1,

                borderColor:"divider",

                borderRadius:2

              }}

            >

              <Download/>

            </IconButton>


          </Tooltip>






          <Tooltip title="Delete">


            <IconButton


              onClick={()=>onDelete(document.id)}


              sx={{

                flex:1,

                border:1,

                borderColor:"error.light",

                borderRadius:2,

                color:"error.main",

                "&:hover":{

                  backgroundColor:"error.light",

                  color:"white"

                }

              }}

            >

              <Delete/>

            </IconButton>


          </Tooltip>



        </Stack>


      </CardContent>


    </Card>

  );

}