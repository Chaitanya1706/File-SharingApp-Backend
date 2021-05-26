const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileinput");
const browseBtn = document.querySelector(".browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const percentDiv = document.querySelector("#percent")

const sharingContainer = document.querySelector(".sharing-container")
const fileURLInput = document.querySelector("#fileURL")
const copyBtn = document.querySelector("#copyBtn")

const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast")

const maxUploadSize = 100 * 1024 * 1024;

const host = "https://quick-fileshare.herokuapp.com/"

const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

dropZone.addEventListener("dragover", (e)=>{
    e.preventDefault();
    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
})

dropZone.addEventListener("dragleave",()=>{
    dropZone.classList.remove("dragged");
})

dropZone.addEventListener("drop",(e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    // console.table(files);
    if(files.length){
        fileInput.files = files;
        uploadFile();
    }
})

copyBtn.addEventListener("click",()=>{
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link Copied")
})

fileInput.addEventListener("change", ()=>{
    uploadFile();
})

browseBtn.addEventListener("click", ()=>{
    fileInput.click();
})

const uploadFile = ()=>{
    
    if(fileInput.files.length >1){
        resestFileInpu();
        showToast("Upload only 1 File!!")
        return;
    }

    const file = fileInput.files[0];

    if(file.size > maxUploadSize){
        showToast("Can't upload more than 100MB")
        resestFileInpu();
        return;
    }

    progressContainer.style.display = `block`;
    const formData = new FormData();
    formData.append("myfile",file);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () =>{
        if(xhr.readyState == XMLHttpRequest.DONE) {
            console.log(xhr.response)
            onUploadSuccess(JSON.parse(xhr.response));
        }
    }

    xhr.upload.onprogress = uploadProgress;

    xhr.upload.onerror = ()=>{
        resestFileInpu();
        showToast(`Error in Upload: ${xhr.statusText}`)
    }

    xhr.open("POST", uploadURL);
    xhr.send(formData);
}

const uploadProgress = (e)=>{
    const percent = Math.round((e.loaded / e.total) * 100);
    console.log(percent);
    bgProgress.style.width = `${percent}%`
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent/100})`;
}

const onUploadSuccess = ({file: url})=>{
    console.log(url);
    resestFileInpu();
    emailForm[2].removeAttribute("disabled");
    sharingContainer.style.display = "block";
    progressContainer.style.display = "none";
    fileURLInput.value = url;
}

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const url = fileURLInput.value;

    const formData = {
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };

    emailForm[2].setAttribute("disabled","true");
    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })
      .then((res)=> res.json())
      .then(({success})=>{
          if(success) {
              sharingContainer.style.display = "none";
              showToast("Email Sent")
          }
      })
});

let toastTimer;
const showToast = msg => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%, 0)"
    clearTimeout(toastTimer);
     toastTimer = setTimeout(() => {
        toast.style.transform = "translate(-50%, 60px)"
    },2000)
}

const resestFileInpu = ()=>{
    fileInput.value = "";
}