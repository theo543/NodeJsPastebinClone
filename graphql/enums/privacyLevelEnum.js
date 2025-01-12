import { GraphQLEnumType } from 'graphql';

const privacyLevelEnum = new GraphQLEnumType({
  name: 'PrivacyLevel',
  values: {
    PUBLIC: { value: 'PUBLIC' },
    UNLISTED: { value: 'UNLISTED' },
    PRIVATE: { value: 'PRIVATE' },
  },
});

export default privacyLevelEnum;