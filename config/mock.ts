import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// 递归读取
function readMockFile(filepath: string) {
  const res = [];
  const files = readdirSync(filepath);

  for (const file of files) {
    const path = join(filepath, file);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      res.push(...readMockFile(path));
    } else {
      res.push(path);
    }

    return res;
  }
}

// 赋予API能力
function create(mocks, app: any) {
  if (mocks == null || typeof mocks !== 'object') {
    throw new Error("mock file's exports must be an object");
  }

  for (const key in mocks) {
    if (!mocks.hasOwnProperty(key)) {
      return;
    }

    const [method, path] = key.split(' ');
    const item = mocks[key];
    const type = typeof item;

    if (type === 'object') {
      app[method.toLocaleLowerCase()](path, (req, res) => {
        res.json(item);
      });
    } else if (type === 'function') {
      app[method.toLocaleLowerCase()](path, item);
    } else {
      throw new Error(`the ${key} must return an object or function`);
    }
  }
}

export default (filepath: string, app: any) => {
  readMockFile(filepath).forEach((item) => create(require(item), app));
};