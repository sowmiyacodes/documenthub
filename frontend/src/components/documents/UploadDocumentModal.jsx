"use client";

import { useState } from "react";

import {
  Upload,
  Close,
  Description,
} from "@mui/icons-material";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  Paper,
} from "@mui/material";


import { uploadDocument } from "@/services/document";



export default function UploadDocumentModal({
  isOpen,
  onClose,
  onUploadSuccess,
}) {


  const [selectedFile,setSelectedFile] = useState(null);

  const [category,setCategory] = useState("Others");

  const [description,setDescription] = useState("");

  const [uploading,setUploading] = useState(false);



  const resetForm = ()=>{

    setSelectedFile(null);

    setCategory("Others");

    setDescription("");

    setUploading(false);

  };



  const handleClose = ()=>{

    if(uploading) return;

    resetForm();

    onClose();

  };




  const handleFileChange=(e)=>{

    if(e.target.files.length>0){

      setSelectedFile(
        e.target.files[0]
      );

    }

  };





  const handleUpload=async()=>{


    if(!selectedFile){

      alert("Please select a document.");

      return;

    }


    try{


      setUploading(true);



      const formData = new FormData();



      formData.append(
        "document",
        selectedFile
      );


      formData.append(
        "category",
        category
      );


      formData.append(
        "description",
        description
      );



      await uploadDocument(formData);



      alert(
        "Document uploaded successfully."
      );



      resetForm();

      onClose();


      if(onUploadSuccess){

        onUploadSuccess();

      }



    }catch(error){


      console.error(error);


      alert(
        error.response?.data?.message ||
        "Failed to upload document."
      );


    }finally{

      setUploading(false);

    }


  };





return (

<Dialog

open={isOpen}

onClose={handleClose}

fullWidth

maxWidth="sm"

>


{/* Header */}


<DialogTitle

sx={{

display:"flex",

justifyContent:"space-between",

alignItems:"center",

fontWeight:700

}}

>


<Box>


<Typography

variant="h5"

fontWeight={700}

>

Upload Document

</Typography>


<Typography

variant="body2"

color="text.secondary"

mt={0.5}

>

Upload PDFs or Images securely.

</Typography>


</Box>



<Button

onClick={handleClose}

disabled={uploading}

sx={{

minWidth:40

}}

>

<Close/>

</Button>



</DialogTitle>






{/* Body */}


<DialogContent>


<Box

sx={{

display:"flex",

flexDirection:"column",

gap:3,

mt:2

}}

>





{/* Upload Area */}


<label htmlFor="document-upload">


<Box

component="div"

sx={{

border:"2px dashed",

borderColor:"primary.light",

backgroundColor:"primary.50",

borderRadius:4,

p:6,

textAlign:"center",

cursor:"pointer",

transition:"0.3s",

"&:hover":{

backgroundColor:"primary.100"

}

}}

>


<Upload

sx={{

fontSize:55,

color:"primary.main"

}}

/>



<Typography

variant="h6"

fontWeight={700}

mt={2}

>

Click to Upload

</Typography>



<Typography

variant="body2"

color="text.secondary"

mt={1}

>

PDF, PNG, JPG, JPEG

</Typography>



<input

id="document-upload"

type="file"

hidden

accept=".pdf,.png,.jpg,.jpeg"

onChange={handleFileChange}

/>



</Box>


</label>







{/* Selected File */}



{

selectedFile &&


<Paper

variant="outlined"

sx={{

p:2,

display:"flex",

alignItems:"center",

gap:2,

borderRadius:3

}}

>


<Description

sx={{

fontSize:35,

color:"primary.main"

}}

/>


<Box>


<Typography

fontWeight={600}

noWrap

>

{selectedFile.name}

</Typography>


<Typography

variant="body2"

color="text.secondary"

>

{

(
selectedFile.size /
1024 /
1024
).toFixed(2)

}

MB

</Typography>


</Box>



</Paper>


}








{/* Category */}



<TextField


select


label="Category"


value={category}


onChange={(e)=>setCategory(e.target.value)}


fullWidth


>


<MenuItem value="Others">
Others
</MenuItem>


<MenuItem value="Identity">
Identity
</MenuItem>


<MenuItem value="Education">
Education
</MenuItem>


<MenuItem value="Medical">
Medical
</MenuItem>


<MenuItem value="Financial">
Financial
</MenuItem>


<MenuItem value="Legal">
Legal
</MenuItem>


</TextField>









{/* Description */}


<TextField


label="Description"


placeholder="Optional description"


multiline


rows={4}


value={description}


onChange={(e)=>setDescription(e.target.value)}


fullWidth


/>




</Box>


</DialogContent>








{/* Footer */}



<DialogActions

sx={{

px:3,

pb:3,

gap:2

}}

>


<Button

variant="outlined"

onClick={handleClose}

disabled={uploading}

sx={{

borderRadius:2,

px:3

}}

>

Cancel

</Button>




<Button

variant="contained"

onClick={handleUpload}

disabled={uploading}


startIcon={

uploading ?

<CircularProgress

size={18}

color="inherit"

/>

:

<Upload/>

}


sx={{

borderRadius:2,

px:4

}}

>


{

uploading

?

"Uploading..."

:

"Upload"

}


</Button>



</DialogActions>



</Dialog>


);

}