function getComponentById(message, id) {
  const componentList = [...message.components]
  for(let component of componentList) {
    if(component.id === id) {
      return component;
    }
    componentList.push(...(component.components ?? []));
  }
  return undefined;
}

function getComponentsById(message, componentIDs) {
  const names = Object.keys(componentIDs);
  const result = {};
  for(let key of names) {
    result[key] = undefined;
  }

  const componentList = [...message.components]
  for(let component of componentList) {
    for(let key of names) {
      if(component.id === componentIDs[key]) {
        result[key] = component;
      }
    }
    componentList.push(...(component.components ?? []));
  }

  return result;
}

export { getComponentById, getComponentsById };

