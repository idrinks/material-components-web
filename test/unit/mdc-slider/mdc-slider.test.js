/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {assert} from 'chai';
import bel from 'bel';
import td from 'testdouble';

import {createMockRaf} from '../helpers/raf';
import {TRANSFORM_PROP} from './helpers';

import {MDCSlider} from '../../../packages/mdc-slider';

suite('MDCSlider');

function getFixture() {
  return bel`
    <div class="mdc-slider" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div class="mdc-slider__track">
        <div class="mdc-slider__track-fill"></div>
      </div>
      <div class="mdc-slider__thumb">
        <svg class="mdc-slider__thumb-handle" width="24" height="24">
          <circle cx="12" cy="12" r="6"></circle>
        </svg>
      </div>
    </div>`;
}

function setupTest() {
  const root = getFixture();
  const component = new MDCSlider(root);
  return {root, component};
}

test('attachTo() instantiates and returns an MDCSlider instance', () => {
  assert.instanceOf(MDCSlider.attachTo(getFixture()), MDCSlider);
});

test('get/set value', () => {
  const {component} = setupTest();
  component.value = 50;

  assert.equal(component.value, 50);
});

test('get/set min', () => {
  const {component} = setupTest();
  component.min = 10;

  assert.equal(component.min, 10);
});

test('get/set max', () => {
  const {component} = setupTest();
  component.max = 80;

  assert.equal(component.max, 80);
});

test('#layout lays out the component', () => {
  const raf = createMockRaf();
  const {root, component} = setupTest();
  raf.flush();

  component.value = 50;
  raf.flush();

  Object.assign(root.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100px',
  });

  document.body.appendChild(root);
  component.layout();
  raf.flush();

  const thumb = root.querySelector('.mdc-slider__thumb');
  assert.include(thumb.style.getPropertyValue(TRANSFORM_PROP), 'translateX(50px)');

  document.body.removeChild(root);
  raf.restore();
});

test('#initialSyncWithDOM syncs the min property with aria-valuemin', () => {
  const root = getFixture();
  root.setAttribute('aria-valuemin', '10');

  const component = new MDCSlider(root);
  assert.equal(component.min, 10);
  component.destroy();
});

test('#initialSyncWithDOM adds an aria-valuemin attribute if not present', () => {
  const root = getFixture();
  root.removeAttribute('aria-valuemin');

  const component = new MDCSlider(root);
  assert.equal(root.getAttribute('aria-valuemin'), String(component.min));
  component.destroy();
});

test('#initialSyncWithDOM syncs the max property with aria-valuemax', () => {
  const root = getFixture();
  root.setAttribute('aria-valuemax', '80');

  const component = new MDCSlider(root);
  assert.equal(component.max, 80);
  component.destroy();
});

test('#initialSyncWithDOM adds an aria-valuemax attribute if not present', () => {
  const root = getFixture();
  root.removeAttribute('aria-valuemax');

  const component = new MDCSlider(root);
  assert.equal(root.getAttribute('aria-valuemax'), String(component.max));
  component.destroy();
});

test('#initialSyncWithDOM syncs the value property with aria-valuenow for continuous slider', () => {
  const root = getFixture();
  root.setAttribute('aria-valuenow', '30');

  const component = new MDCSlider(root);
  assert.equal(component.value, 30);
  component.destroy();
});

test('#initialSyncWithDOM adds an aria-valuenow attribute if not present', () => {
  const root = getFixture();
  root.removeAttribute('aria-valuenow');

  const component = new MDCSlider(root);
  assert.equal(root.getAttribute('aria-valuenow'), String(component.value));
  component.destroy();
});

test('adapter#hasClass checks if a class exists on root element', () => {
  const {root, component} = setupTest();
  root.classList.add('foo');

  assert.isTrue(component.getDefaultFoundation().adapter_.hasClass('foo'));
});

test('adapter#addClass adds a class to the root element', () => {
  const {root, component} = setupTest();
  component.getDefaultFoundation().adapter_.addClass('foo');

  assert.include(root.className, 'foo');
});

test('adapter#removeClass removes a class from the root element', () => {
  const {root, component} = setupTest();
  root.classList.add('foo');
  component.getDefaultFoundation().adapter_.removeClass('foo');

  assert.notInclude(root.className, 'foo');
});

test('adapter#getAttribute retrieves an attribute value from the root element', () => {
  const {root, component} = setupTest();
  root.setAttribute('data-foo', 'bar');

  assert.equal(component.getDefaultFoundation().adapter_.getAttribute('data-foo'), 'bar');
});

test('adapter#setAttribute sets an attribute on the root element', () => {
  const {root, component} = setupTest();
  component.getDefaultFoundation().adapter_.setAttribute('data-foo', 'bar');

  assert.equal(root.getAttribute('data-foo'), 'bar');
});

test('adapter#computeBoundingRect computes the client rect on the root element', () => {
  const {root, component} = setupTest();
  assert.deepEqual(
    component.getDefaultFoundation().adapter_.computeBoundingRect(),
    root.getBoundingClientRect()
  );
});

test('adapter#notifyInput emits a MDCSlider:input event with the slider instance as its detail', () => {
  const {root, component} = setupTest();
  const handler = td.func('inputHandler');

  root.addEventListener('MDCSlider:input', handler);
  component.getDefaultFoundation().adapter_.notifyInput();

  td.verify(handler(td.matchers.argThat(({detail}) => detail === component)));
});

test('adapter#notifyChange emits a MDCSlider:change event with the slider instance as its detail', () => {
  const {root, component} = setupTest();
  const handler = td.func('changeHandler');

  root.addEventListener('MDCSlider:change', handler);
  component.getDefaultFoundation().adapter_.notifyChange();

  td.verify(handler(td.matchers.argThat(({detail}) => detail === component)));
});

test('adapter#setThumbStyleProperty sets a style property on the thumb element', () => {
  const {root, component} = setupTest();
  const thumb = root.querySelector('.mdc-slider__thumb');

  const div = bel`<div></div>`;
  div.style.backgroundColor = 'black';

  component.getDefaultFoundation().adapter_.setThumbStyleProperty('background-color', 'black');

  assert.equal(thumb.style.backgroundColor, div.style.backgroundColor);
});

test('adapter#setTrackFillStyleProperty sets a style property on the track-fill element', () => {
  const {root, component} = setupTest();
  const trackFill = root.querySelector('.mdc-slider__track-fill');

  const div = bel`<div></div>`;
  div.style.backgroundColor = 'black';

  component.getDefaultFoundation().adapter_.setTrackFillStyleProperty('background-color', 'black');

  assert.equal(trackFill.style.backgroundColor, div.style.backgroundColor);
});
