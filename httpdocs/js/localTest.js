function loadMd(url) {
  let protoURl = url;
  if (url.includes('github.com')) {
    url = url.replace('github.com', 'raw.githubusercontent.com');
    url = url.replace('blob/', '');
  }
  const prefix = url.substr(0, url.lastIndexOf('/') + 1) + 'docs/';
  const protoName = url.substr(url.lastIndexOf('/') + 1).replace('.proto', '');
  const mdUrl = prefix + protoName.toLowerCase() + '.md';
  fetch(url).then(response => response.text())
    .then(proto => {
      fetch(mdUrl)
        .then(response => {
          if (!response.ok)
            throw new Error('');
          response.text();
        })
        .then(content => {
          let infoArray = createMdFromProto(protoURl, proto);
          populateProtoViewDiv(content, prefix, infoArray);
        }).catch(() => {
          // No md file, so we read the description from the proto file
          fetch(url)
            .then(response => response.text())
            .then(content => {
              createMdFromProto(protoURl, proto, protoName, true);
            });
        });
    });
}

function createMdFromProto(protoURl, proto, protoName, generateAll) {
  // parse header
  let version, license, licenseUrl;
  let description = '';
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  for (const line of proto.split('\n')) {
    if (!line.startsWith('#'))
      break;

    if (line.startsWith('#VRML_SIM') || line.startsWith('# VRML_SIM'))
      version = line.substring(line.indexOf('VRML_SIM') + 9).split(' ')[0];
    else if (line.startsWith('# license:') || line.startsWith('#license:'))
      license = line.substring(line.indexOf('license:') + 9);
    else if (line.startsWith('# license url:') || line.startsWith('#license url:'))
      licenseUrl = line.substring(line.indexOf('license url:') + 13);
    else if (line.startsWith('#tags:') || line.startsWith('# tags:') || line.startsWith('# template language:') ||
      line.startsWith('#template language:') || line.startsWith('# documentation url:') ||
      line.startsWith('#documentation url:'))
      continue;
    else {
      let newLine = line.replace('#', '').replace('_', '\\_').trim()
      newLine = newLine.replace(urlRegex, url => `[${url}](${url})`);
      description += newLine + '\n';
    }
  }

  const infoGrid = document.createElement('div');
  infoGrid.className = 'proto-info-array';

  const versionP = document.createElement('p');
  versionP.textContent = 'Version';
  versionP.className = 'info-array-cell first-column-cell first-row-cell';
  versionP.style.gridRow = 1;
  versionP.style.gridColumn = 1;
  infoGrid.appendChild(versionP);

  const versionContentA = document.createElement('a');
  versionContentA.textContent = version;
  versionContentA.href = 'https://github.com/cyberbotics/webots/releases/tag/' + version;
  versionContentA.target = '_blank';
  versionContentA.className = 'info-array-cell last-column-cell first-row-cell';
  versionContentA.style.gridRow = 1;
  versionContentA.style.gridColumn = 2;
  infoGrid.appendChild(versionContentA);

  const licenseP = document.createElement('p');
  licenseP.textContent = 'License';
  licenseP.className = 'info-array-cell first-column-cell';
  licenseP.style.gridRow = 2;
  licenseP.style.gridColumn = 1;
  licenseP.style.backgroundColor = '#fafafa';
  infoGrid.appendChild(licenseP);

  const licenseContentA = document.createElement('a');
  licenseContentA.textContent = license;
  licenseContentA.className = 'info-array-cell last-column-cell';
  licenseContentA.href = licenseUrl;
  licenseContentA.target = '_blank';
  licenseContentA.style.backgroundColor = '#fafafa';
  licenseContentA.style.gridRow = 2;
  licenseContentA.style.gridColumn = 2;
  infoGrid.appendChild(licenseContentA);

  const sourceP = document.createElement('p');
  sourceP.textContent = 'Source';
  sourceP.className = 'info-array-cell first-column-cell';
  sourceP.style.gridRow = 3;
  sourceP.style.gridColumn = 1;
  infoGrid.appendChild(sourceP);

  const sourceContentA = document.createElement('a');
  sourceContentA.href = protoURl;
  sourceContentA.className = 'info-array-cell last-column-cell';
  sourceContentA.textContent = protoURl;
  sourceContentA.target = '_blank';
  sourceContentA.style.gridRow = 3;
  sourceContentA.style.gridColumn = 2;
  infoGrid.appendChild(sourceContentA);

  if (generateAll) {
    const fieldRegex = /\[\n((.*\n)*)\]/mg;
    let matches = proto.matchAll(fieldRegex);
    let fieldsDefinition;
    const fieldEnumeration = new Map();
    const describedField = [];
    let fields = '';
    let file = '';
    for (const match of matches) {
      fieldsDefinition = match[1];
      break;
    }

    // remove enumerations
    const removeEnumRegex = /.*ield\s+([^ ]*?)(\{(?:[^\[\n]*\,?\s?)(?<!(\{))\})\s+([^ ]*)\s+([^#\n]*)(#?)(.*)/mg;
    matches = fieldsDefinition.matchAll(removeEnumRegex);
    for (const match of matches) {
      fieldEnumeration.set(match[4], match[2].slice(1, -1).split(','));
      if (match[0].includes('\n')) {
        const string = ' '.repeat(match[0].indexOf(match[2]));
        fieldsDefinition = fieldsDefinition.replace(string + match[4], match[4]);
        fieldsDefinition = fieldsDefinition.replace(match[2] + '\n', '');
        if (match[2].length < 40)
          fieldsDefinition = fieldsDefinition.replace(match[2], ' '.repeat(match[2].length));
        else
          fieldsDefinition = fieldsDefinition.replace(match[2], '');
      }
    }

    const spacingRegex = /.*ield\s+([^ ]*?)(\s+)([^ ]*)\s+([^#\n]*)(#?)(.*)/mg;
    matches = fieldsDefinition.matchAll(spacingRegex);
    let minSpaces = 2000;
    for (const match of matches) {
      let spaces = match[2];
      if (spaces.length < minSpaces)
        minSpaces = spaces.length;
    }
    const spacesToRemove = Math.max(minSpaces - 2, 0);

    const cleaningRegex = /^\s*(.*?ield)\s+([^ \{]*)(\s+)([^ ]*)\s+([^#\n]*)(#?)(.*)((\n*( {4}| {2}\]).*)*)/gm;
    const isDescriptionRegex = /Is\s`([a-zA-Z]*).([a-zA-Z]*)`./g;

    const baseNodeList = ['WorldInfo', 'Hinge2JointParameters', 'PBRAppearance', 'ContactProperties', 'SolidReference',
      'Charger', 'Capsule', 'Mesh', 'Background', 'BallJoint', 'Focus', 'RotationalMotor', 'ElevationGrid', 'Pen',
      'Cylinder', 'GPS', 'SliderJoint', 'Compass', 'Emitter', 'Track', 'Cone', 'LED', 'Slot', 'Radar', 'Coordinate',
      'HingeJointParameters', 'Hinge2Joint', 'LinearMotor', 'Sphere', 'JointParameters', 'TrackWheel', 'Appearance',
      'HingeJoint', 'DirectionalLight', 'Accelerometer', 'Viewpoint', 'Speaker', 'IndexedLineSet', 'PointSet', 'Damping',
      'ImmersionProperties', 'Robot', 'Lidar', 'DistanceSensor', 'Camera', 'Lens', 'Altimeter', 'Color', 'Transform',
      'Recognition', 'Connector', 'Propeller', 'LensFlare', 'BallJointParameters', 'TextureTransform', 'IndexedFaceSet',
      'Normal', 'Fog', 'Display', 'TouchSensor', 'Shape', 'TextureCoordinate', 'Box', 'ImageTexture', 'Radio', 'CadShape',
      'Plane', 'RangeFinder', 'Physics', 'SpotLight', 'Brake', 'PointLight', 'PositionSensor', 'Zoom', 'InertialUnit',
      'LightSensor', 'Gyro', 'Receiver', 'Microphone', 'Solid', 'Billboard', 'Fluid', 'Muscle', 'Group', 'Skin',
      'Material'];

    // remove enumeration
    matches = fieldsDefinition.matchAll(cleaningRegex);

    const removeCommentRegex = /\s*(#.*)/mg;
    const removeInitialFieldRegex = /^\s*.*field\s/mg;
    for (const match of matches) {
      if (!(match[1].includes('hiddenField') || match[1].includes('deprecatedField'))) {
        const fieldType = match[2];
        const spaces = match[3];
        const fieldName = match[4];
        const fieldComment = match[7].trim();
        // skip 'Is `NodeType.fieldName`.' descriptions
        const isComment = fieldComment.match(isDescriptionRegex);
        if (fieldComment && !isComment) {
          // add link to base nodes:
          for (const baseNode of baseNodeList) {
            if (fieldComment.indexOf(baseNode) !== -1) {
              const link = ' [' + baseNode + '](https://cyberbotics.com/doc/reference/' + baseNode.toLowerCase() + ')';
              fieldComment.replace(' ' + baseNode, link);
            }
          }
          describedField.push([fieldType, fieldName, fieldComment]);
        }
        // remove the comment
        let fieldString = match[0];
        fieldString = fieldString.replace(removeCommentRegex, '');
        // remove intial '*field' string
        fieldString = fieldString.replace(removeInitialFieldRegex, '');
        fieldString = fieldString.replace('webots://', 'https://raw.githubusercontent.com/cyberbotics/webots/released');

        // remove unwanted spaces between field type and field name (if needed)
        if (spacesToRemove > 0)
          fieldString = fieldString.replace(fieldType + ' '.repeat(spacesToRemove), fieldType);

        fields += fieldString + '\n';
      }
    }
    fetch('https://cyberbotics.com/wwi/proto/protoVisualizer/temporary-proto-list.xml')
      .then(result => result.text())
      .then(content => {
        const xml = new window.DOMParser().parseFromString(content, 'text/xml');
        const protos = xml.getElementsByTagName('proto');
        let protoNode;
        for (const proto of protos) {
          if (proto.getElementsByTagName('name')[0].textContent === protoName) {
            protoNode = proto;
            break;
          }
        }
        const baseType = protoNode.getElementsByTagName('base-type')[0].textContent;

        file += description + '\n';
        file += 'Derived from [' + baseType + '](https://cyberbotics.com/doc/reference/' + baseType.toLowerCase() + '.\n\n';
        file += '```\n';
        file += protoName + ' {\n';
        file += fields;
        file += '}\n';
        file += '```\n\n';

        if (describedField) {
          file += ' ### ' + protoName + ' Field Summary\n\n';
          for (const [fieldType, fieldName, fielDescription] of describedField) {
            file += '- ' + fieldName + ' : ' + fielDescription;
            const isMFField = fieldType.startsWith('MF');
            if (fieldEnumeration.has(fieldName)) {
              const values = fieldEnumeration.get(fieldName);
              if (isMFField)
                file += ' This field accept a list of ';
              else {
                if (values.length > 1)
                  file += ' This field accepts the following values: ';
                else
                  file += ' This field accepts the following value: ';
              }

              for (let i = 0; i < values.length; i++) {
                const value = values[i].split('{')[0]; // In case of node keep only the type
                if (i === values.length - 1) {
                  if (isMFField)
                    file += '`' + value.trim() + '` ' + fieldType.replace('MF', '').toLowerCase() + 's.';
                  else
                    file += '`' + value.trim() + '`.';
                } else if (i === values.length - 2) {
                  if (values.length === 2)
                    file += '`' + value.trim() + '` and ';
                  else
                    file += '`' + value.trim() + '`, and ';
                } else
                  file += '`' + value.trim() + ', ';
              }
            }
            file += '\n\n';
          }
        }
        console.log(file)
      });
  }
  return infoGrid;
}

// loadMd('https://github.com/cyberbotics/webots/blob/released/projects/objects/chairs/protos/OfficeChair.proto')
loadMd('https://github.com/cyberbotics/webots/blob/released/projects/appearances/protos/Grass.proto')