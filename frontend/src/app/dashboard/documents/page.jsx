"use client";

import { useEffect, useState } from "react";

import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Paper,
  CircularProgress,
  InputAdornment,
  Dialog,
} from "@mui/material";

import {
  Upload,
  Search,
  FolderOpen,
  FilterList,
} from "@mui/icons-material";

import UploadDocumentModal from "@/components/documents/UploadDocumentModal";
import DocumentCard from "@/components/documents/DocumentCard";

import {
  getDocuments,
  deleteDocument,
  viewDocument,
} from "@/services/document";


export default function DocumentsPage() {

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);


  const loadDocuments = async () => {

    try {

      setLoading(true);

      const response = await getDocuments();

      setDocuments(response.documents || []);

    } catch(err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadDocuments();

  }, []);



  const handleView = async(id)=>{

    try{

      const response = await viewDocument(id);

      window.open(response.url,"_blank");

    }catch(err){

      console.error(err);

    }

  };



  const handleDelete = async(id)=>{

    if(!window.confirm("Delete this document?"))
      return;


    try{

      await deleteDocument(id);

      loadDocuments();

    }catch(err){

      console.error(err);

    }

  };



  const filteredDocuments = documents.filter((doc)=>{


    const matchSearch =
      doc.file_name
      ?.toLowerCase()
      .includes(search.toLowerCase());


    const matchCategory =
      category==="All" ||
      doc.category===category;


    return matchSearch && matchCategory;


  });



return (

<Box sx={{p:{xs:2,md:4}}}>


{/* Header */}

<Box
sx={{
display:"flex",
justifyContent:"space-between",
alignItems:{md:"center"},
flexDirection:{xs:"column",md:"row"},
gap:3,
mb:5
}}
>


<Box>

<Typography
variant="subtitle2"
color="primary"
fontWeight={700}
>
Document Vault
</Typography>


<Typography
variant="h3"
fontWeight={800}
mt={1}
>
My Documents
</Typography>


<Typography
color="text.secondary"
mt={1}
>
{documents.length} document
{documents.length!==1?"s":""}
stored securely.
</Typography>


</Box>



<Button
variant="contained"
size="large"
startIcon={<Upload/>}
onClick={()=>setIsUploadModalOpen(true)}

sx={{
borderRadius:3,
px:4,
py:1.5,
textTransform:"none",
fontWeight:700
}}

>

Upload Document

</Button>


</Box>





{/* Search and Filter */}

<Paper

elevation={2}

sx={{

p:3,

borderRadius:4,

mb:5,

display:"flex",

gap:2,

flexDirection:{
xs:"column",
md:"row"
}

}}

>


<TextField

fullWidth

placeholder="Search by file name..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

InputProps={{

startAdornment:(

<InputAdornment position="start">

<Search/>

</InputAdornment>

)

}}

/>



<FormControl

sx={{

minWidth:{
xs:"100%",
md:220
}

}}

>


<InputLabel>

Category

</InputLabel>


<Select

value={category}

label="Category"

onChange={(e)=>setCategory(e.target.value)}

startAdornment={

<FilterList sx={{mr:1}}/>

}

>


<MenuItem value="All">
All
</MenuItem>


<MenuItem value="Education">
Education
</MenuItem>


<MenuItem value="Identity">
Identity
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


<MenuItem value="Others">
Others
</MenuItem>


</Select>


</FormControl>


</Paper>





{/* Loading */}

{
loading &&

<Box
sx={{
display:"flex",
justifyContent:"center",
py:10
}}
>

<CircularProgress/>

</Box>

}





{/* Empty State */}


{
!loading &&
filteredDocuments.length===0 &&

<Card

sx={{

borderRadius:5,

py:10,

textAlign:"center"

}}

>


<Box>

<Box

sx={{

width:100,

height:100,

borderRadius:"50%",

bgcolor:"primary.light",

display:"flex",

alignItems:"center",

justifyContent:"center",

mx:"auto"

}}

>

<FolderOpen

sx={{

fontSize:55,

color:"primary.main"

}}

/>

</Box>



<Typography
variant="h5"
fontWeight={700}
mt={4}
>

No Documents Found

</Typography>


<Typography

color="text.secondary"

mt={2}

>

Upload your first document and build your secure
AI-powered document vault.

</Typography>



<Button

variant="contained"

sx={{mt:4}}

onClick={()=>setIsUploadModalOpen(true)}

>

Upload First Document

</Button>


</Box>


</Card>

}





{/* Document Cards */}


{

!loading &&
filteredDocuments.length>0 &&


<Grid

container

spacing={3}

>


{

filteredDocuments.map((document)=>(


<Grid

item

xs={12}

sm={6}

lg={4}

key={document.id}

>


<DocumentCard

document={document}

onView={handleView}

onDelete={handleDelete}

/>


</Grid>


))


}


</Grid>


}



<UploadDocumentModal

isOpen={isUploadModalOpen}

onClose={()=>setIsUploadModalOpen(false)}

onUploadSuccess={()=>{

setIsUploadModalOpen(false);

loadDocuments();

}}

/>



</Box>


);

}