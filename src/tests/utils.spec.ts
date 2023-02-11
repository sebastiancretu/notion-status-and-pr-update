import { getUrlsFromString, getPageIds } from '../utils';
describe('util', () => {
  describe('getUrlsFromString', () => {
    const payload = {
      body: '',
    };

    it('should return empty array when no url present', async () => {
      payload.body =
        'It is a long established fact that a reader will be distracted by the readable content.';
      expect(getUrlsFromString(payload)).toHaveLength(0);
    });

    it('should return empty array when body empty', async () => {
      payload.body = '';
      expect(getUrlsFromString(payload)).toHaveLength(0);
    });

    it('should return notion url', async () => {
      payload.body =
        'Lorem Ipsum is simply dummy text of [notion ticket](https://www.notion.so/sample/93a37ade33c44a8a9970a9d70c800d38?v=a6e53baea5c2294186465e5b6e567bc4&p=6fb007c7595b4034aadc0f3bdf77c2f0&pm=s)the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.';
      const urls = getUrlsFromString(payload);

      expect(urls).toHaveLength(1);
      expect(urls[0].href).toEqual(
        'https://www.notion.so/sample/93a37ade33c44a8a9970a9d70c800d38?v=a6e53baea5c2294186465e5b6e567bc4&p=6fb007c7595b4034aadc0f3bdf77c2f0&pm=s'
      );
    });

    it('should return only the notion url', async () => {
      payload.body =
        'Lorem Ipsum is simply dummy text of [notion ticket](https://www.notion.so/sample/93a37ade33c44a8a9970a9d70c800d38?v=a6e53baea5c2294186465e5b6e567bc4&p=6fb007c7595b4034aadc0f3bdf77c2f0&pm=s)the printing and typesetting [industry](https://www.google.com). Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.';
      const urls = getUrlsFromString(payload);

      expect(urls).toHaveLength(1);
      expect(urls[0].href).toEqual(
        'https://www.notion.so/sample/93a37ade33c44a8a9970a9d70c800d38?v=a6e53baea5c2294186465e5b6e567bc4&p=6fb007c7595b4034aadc0f3bdf77c2f0&pm=s'
      );
    });

    it('should return all notion types of urls', async () => {
      payload.body =
        'Lorem Ipsum is simply dummy text of [notion ticket](https://www.notion.so/sample/93a37ade33c44a8a9970a9d70c800d38?v=a6e53baea5c2294186465e5b6e567bc4&p=6fb007c7595b4034aadc0f3bdf77c2f0&pm=s)the printing and typesetting [industry](https://www.notion.so/sample/Lorem-Ipsum-is-simply-dummy-text-of-notion-6fb007a3595b4034aadc0f3bdf22c2f0). Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.';
      const urls = getUrlsFromString(payload);

      expect(urls).toHaveLength(2);
      expect(urls.pop()?.href).toEqual(
        'https://www.notion.so/sample/Lorem-Ipsum-is-simply-dummy-text-of-notion-6fb007a3595b4034aadc0f3bdf22c2f0'
      );
    });

    it('should return all notion types of urls with custom delimiters', async () => {
      const delimitersPayload = {
        body: 'Lorem Ipsum is simply dummy text of [https://www.notion.so/sample/93a37ade33c44a8a9970a9d70c800d38?v=a6e53baea5c2294186465e5b6e567bc4&p=6fb007c7595b4034aadc0f3bdf77c2f0&pm=s]the printing and typesetting [industry](https://www.notion.so/sample/Lorem-Ipsum-is-simply-dummy-text-of-notion-6fb007a3595b4034aadc0f3bdf22c2f0). Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
        leftDelimiter: '[',
        rightDelimiter: ']',
      };
      const urls = getUrlsFromString(delimitersPayload);

      expect(urls).toHaveLength(1);
      expect(urls.pop()?.href).toEqual(
        'https://www.notion.so/sample/93a37ade33c44a8a9970a9d70c800d38?v=a6e53baea5c2294186465e5b6e567bc4&p=6fb007c7595b4034aadc0f3bdf77c2f0&pm=s'
      );
    });

    it('should return empty array when delimiters are identical', async () => {
      payload.body =
        'Lorem Ipsum is simply dummy text of notion ticket |https://www.notion.so/sample/93a37ade33c44a8a9970a9d70c800d38?v=a6e53baea5c2294186465e5b6e567bc4&p=6fb007c7595b4034aadc0f3bdf77c2f0&pm=s|the printing and typesetting industry |https://www.notion.so/sample/Lorem-Ipsum-is-simply-dummy-text-of-notion-6fb007a3595b4034aadc0f3bdf22c2f0|. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.';
      expect(getUrlsFromString(payload)).toHaveLength(0);
    });
  });

  describe('getPageIds', () => {
    it('should return array of ids for any notion url type', async () => {
      const resp = [
        'https://www.notion.so/sample/93a37ade33c44a8a9970a9d70c800d38?v=a6e53baea5c2294186465e5b6e567bc4&p=6fb007c7595b4034aadc0f3bdf77c2f1&pm=s',
        'https://www.notion.so/sample/lorem-ipsum-is-simply-dummy-text-of-notion-6fb007a3595b4034aadc0f3bdf22c2f0',
        'https://www.notion.so/sample/0fa9241e82314e229fe115d7bc996b47',
      ].map((r) => new URL(r));
      const ids = getPageIds(resp);

      expect(ids).toHaveLength(3);
      expect(ids).toMatchObject([
        '6fb007c7595b4034aadc0f3bdf77c2f1',
        '6fb007a3595b4034aadc0f3bdf22c2f0',
        '0fa9241e82314e229fe115d7bc996b47',
      ]);
    });

    it('should return nothing when empty array', async () => {
      const resp = [];
      expect(getPageIds(resp)).toHaveLength(0);
    });
  });
});
