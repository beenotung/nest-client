import { AnimalService } from './animal.service';
import { FileService } from './file.service';

let baseUrl = 'http://localhost:3000';

let animalService = new AnimalService(baseUrl);
let fileService = new FileService(baseUrl);

async function main() {
  console.log({
    test: 'post animal.talk',
    result: await animalService.talk()
  });
  console.log({
    test: 'get animal.name',
    result: await animalService.name()
  });
  console.log({
    test: 'get echo',
    result: await animalService.getEcho('fake-channel', 'fake-topic')
  });
  console.log({
    test: 'post echo',
    result: await animalService.postEcho('fake-channel', 'fake-topic')
  });

  console.log({
    test: 'file.single',
    result: await fileService.single(
      fakeFile('single.txt', 'fake single file content')
    )
  });
  console.log({
    test: 'file.array',
    result: await fileService.array([
      fakeFile('array-1.txt', 'fake array content 1'),
      fakeFile('array-2.txt', 'fake array content 2')
    ])
  });
  console.log({
    test: 'file.multiple',
    result: await fileService.multiple({
      avatar: [fakeFile('avatar.txt', 'fake avatar content')],
      background: [fakeFile('background.txt', 'fake background content')]
    })
  });
}
main().catch(e => console.error(e));

function fakeFile(filename: string, content: string): File {
  let blob = new Blob([content]);
  let file = new File([blob], filename, { type: 'text/plain' });
  return file;
}
