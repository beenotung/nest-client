import { selectImage } from '@beenotung/tslib/file';
import { FileService } from './file.service';

let fileService = new FileService('http://localhost:3000');
let button = document.createElement('button');
button.addEventListener('click', () =>
  selectImage({ multiple: true })
    .then(files => {
      files.forEach(file => {
        fileService.postSingleFile(file)
          .then(res => {
            console.log({ res });
            let p = document.createElement('p');
            p.textContent = res;
            document.body.appendChild(p);
          });
      });
    }));
button.textContent = 'upload';
document.body.appendChild(button);
