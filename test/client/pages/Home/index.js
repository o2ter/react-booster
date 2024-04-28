//
//  index.js
//
//  Copyright (c) 2021 - 2024 O2ter Limited. All rights reserved.
//

import _ from 'lodash';
import React from 'react';
import { View, BBCode, RichTextInput } from '@o2ter/react-ui';

export default function Home() {

  const [value, setValue] = React.useState(`
[b]hello, world[/b]
[center]
[u]hello, world[/u]
[b]hello, [u]world[/u][/b][/center]
[u]hello, [b]world[/b][/u]
[center]
[s]hello, world[/s]
[b]hello, [s]world[/s][/b][/center]
[s]hello, [b]world[/b][/s]
[center]
[s]hello, world[/s]
[u]hello, [s]world[/s][/u][/center]
[s]hello, [u]world[/u][/s]
[ol]
[li]abc
[li]abc
[center]abc[/center]
[center]abc
abc[/center]
[/ol]
[ul]
[li]abc
[li]abc
[indent=1]abc
vfdvsf[/indent]
[/ul]
`);

  return (
    <View classes='p-1'>
      <View classes='row'>
        <View classes='col'>
          <RichTextInput
            className='dvh-75'
            value={value}
            onChangeText={setValue}
          />
        </View>
        <View classes='col'>
          <BBCode source={{ content: value }} />
        </View>
      </View>
    </View>
  );
}
