const formidable = require('formidable');
const {
  uploadFileToS3,
  getBucketListFromS3,
  getPresignedURL,
} = require('./s3-service');

async function s3Upload(req, res) {
  const formData = await readFormData(req);
  try {
    const fileUploaded = await uploadFileToS3(formData.file, 'pupeee');
    if (fileUploaded) {
      return res.json({ success: true, url: fileUploaded.Location });
    } else {
      res.json({ success: false, url: '' });
    }
  } catch (ex) {
    res.json({ success: false, message: 'Some thing went wrond' });
  }
}

async function s3Get(req, res) {
  try {
    const bucketData = await getBucketListFromS3('pupeee');
    const { Contents = [] } = bucketData;
    res.send(
      Contents.map((content) => {
        return {
          key: content.Key,
          size: (content.Size / 1024).toFixed(1) + ' KB',
          lastModified: content.LastModified,
        };
      })
    );
  } catch (ex) {
    res.send([]);
  }
}

async function upLoadMultipleFiles(req, res) {
  const form = formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));
      return;
    }
    let sendData = [];
    let nnum = 0;
    if (!files.file.length) {
      return res
        .status(500)
        .json({ success: false, message: 'Please provide multiple files' });
    }

    files.file.map(async (data, index) => {
      console.log('In mu 2');
      const fileUploaded = await uploadFileToS3(data, 'pupeee');

      if (fileUploaded) {
        sendData.push(fileUploaded.Location);
        nnum = nnum + 1;
        if (nnum == files.file.length) {
          console.log('Updatedd :: ', sendData);
          res.json({ success: true, data: sendData });
        }
      }
    });
  });
}

async function readFormData(req) {
  return new Promise((resolve) => {
    const dataObj = {};
    var form = new formidable.IncomingForm();
    form.parse(req);

    form.on('file', (name, file) => {
      dataObj.name = name;
      dataObj.file = file;
    });

    form.on('end', () => {
      resolve(dataObj);
    });
  });
}

async function getSignedUrl(req, res) {
  try {
    const { key } = req.params;
    const url = await getPresignedURL('pupeee', key);
    res.send(url);
  } catch (ex) {
    res.send('');
  }
}

module.exports = {
  s3Upload,
  s3Get,
  getSignedUrl,
  upLoadMultipleFiles,
};
