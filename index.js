const core = require('@actions/core');

const archiver = require('archiver');
const { WritableStreamBuffer } = require('stream-buffers');

const axios = require('axios');
const FormData = require('form-data');

async function run() {
  try {
    // load inputs
    const folder = core.getInput('folder');
    const url = new URL(core.getInput('url'));
    const token = core.getInput('token');

    // add redaxo API param
    url.searchParams.set('rex-api-call', 'headless_deploy');

    // create buffer
    const outputStreamBuffer = new WritableStreamBuffer({
        initialSize: (1000 * 1024),   // start at 1000 kilobytes.
        incrementAmount: (1000 * 1024) // grow by 1000 kilobytes each time buffer overflows.
    });

    // create archiver instance
    const archive = archiver('zip');
    // pipe zip to buffer
    archive.pipe(outputStreamBuffer);

    // catch warnings
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        core.warning(err.message);
      } else {
        // throw error
        throw err;
      }
    });

    // catch errors
    archive.on('error', function(err) {
      throw err;
    });

    // copy files from dist folder to zip
    archive.directory(folder, false);

    // create zip
    archive.finalize().then(() => {
      // end buffer input
      outputStreamBuffer.end();

      // create form data instance
      const formData = new FormData();

      // add post data
      formData.append('token', token);
      formData.append('file', outputStreamBuffer.getContents(), {
        contentType: 'application/zip',
        filename: 'headless.zip',
      });

      // create request
      axios({
        method: 'post',
        url: url.toString(),
        headers: formData.getHeaders(),
        data: formData
      }).then(res => {
        // log info incase of success
        core.info(res.data.msg);
      }).catch(res => {
        // log error incase of failure
        core.error(res.data.msg);
      });
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
