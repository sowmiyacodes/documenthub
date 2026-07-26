"use client";

import { ArrowUpward } from "@mui/icons-material";

import {
  Card,
  CardContent,
  Box,
  Typography,
} from "@mui/material";


export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
}) {


  const colors = {

    blue: {
      bg: "primary.light",
      text: "primary.main",
    },

    green: {
      bg: "success.light",
      text: "success.main",
    },

    amber: {
      bg: "warning.light",
      text: "warning.main",
    },

    purple: {
      bg: "secondary.light",
      text: "secondary.main",
    },

  };



  const selectedColor =
    colors[color] || colors.blue;



  return (

    <Card

      elevation={1}

      sx={{

        borderRadius:4,

        border:"1px solid",

        borderColor:"divider",

        transition:"all 0.3s ease",

        "&:hover":{

          transform:"translateY(-6px)",

          boxShadow:
          "0 10px 25px rgba(0,0,0,0.12)"

        }

      }}

    >


      <CardContent

        sx={{

          p:3

        }}

      >



        {/* Top Section */}


        <Box

          sx={{

            display:"flex",

            justifyContent:"space-between",

            alignItems:"flex-start"

          }}

        >



          <Box>


            <Typography

              variant="body2"

              color="text.secondary"

              fontWeight={500}

            >

              {title}

            </Typography>





            <Typography

              variant="h3"

              fontWeight={800}

              mt={1.5}

              color="text.primary"

            >

              {value}

            </Typography>






            {
              subtitle &&

              <Typography

                variant="body2"

                color="text.disabled"

                mt={1}

              >

                {subtitle}

              </Typography>

            }



          </Box>








          {/* Icon */}


          <Box

            sx={{

              width:56,

              height:56,

              borderRadius:3,

              display:"flex",

              alignItems:"center",

              justifyContent:"center",

              backgroundColor:
              selectedColor.bg,

              color:
              selectedColor.text,

            }}

          >


            <Icon

              sx={{

                fontSize:30

              }}

            />


          </Box>




        </Box>







        {/* Footer */}



        <Box

          sx={{

            mt:3,

            display:"flex",

            alignItems:"center",

            gap:1,

            color:"primary.main",

            fontWeight:600,

            cursor:"pointer"

          }}

        >


          <ArrowUpward

            sx={{

              fontSize:18

            }}

          />


          <Typography

            variant="body2"

            fontWeight={600}

          >

            View Details

          </Typography>



        </Box>



      </CardContent>


    </Card>


  );

}