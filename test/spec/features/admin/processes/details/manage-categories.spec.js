(function() {
  'use strict';
  describe('Manage Category Mapping Modal Instance', function(){
    var scope, controller, manageCategoryMappingModalInstanceCtrl,
      process, categories, q, selectedCategories, modalInstance, categoryManager,
      cat1, cat2, cat3;
     
    beforeEach(module('org.bonitasoft.features.admin.processes.details.information.categories'));

    describe('controller ', function () {
      beforeEach(inject(function($rootScope, $controller, $q) {
        scope = $rootScope.$new();
        controller = $controller;
        q = $q;
        cat1 = {id:111, name: 'catego1'};
        cat2 = {id:222, name: 'catego2'};
        cat3 = {id:333, name: 'catego3'};
        categories = [cat1, cat2, cat3];
        selectedCategories = [cat1];
        process = {id: 123};
        categoryManager = jasmine.createSpyObj('categoryManager', ['updateCategories']);
        modalInstance = jasmine.createSpyObj('modalInstance', ['dismiss', 'close']);
        manageCategoryMappingModalInstanceCtrl = controller('ManageCategoryMappingModalInstanceCtrl', {
          $scope : scope,
          process : process,
          initiallySelectedCategories : selectedCategories,
          allCategories : categories,
          categoryManager : categoryManager,
          $modalInstance : modalInstance
        });
      }));

      it('should init controller', function(){
        expect(manageCategoryMappingModalInstanceCtrl.tags).toEqual(['catego1', 'catego2', 'catego3']);
        expect(manageCategoryMappingModalInstanceCtrl.selectedTags).toEqual(['catego1']);
      });

      it('should dismiss modal', function(){
        manageCategoryMappingModalInstanceCtrl.cancel();
        expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
      });

      it('should close modal and update categories', function(){
        var promisesAndCategories = {};
        categoryManager.updateCategories.and.returnValue(promisesAndCategories);
        manageCategoryMappingModalInstanceCtrl.updateCategories();
        expect(modalInstance.close).toHaveBeenCalledWith(promisesAndCategories);
        expect(categoryManager.updateCategories).toHaveBeenCalledWith(categories, selectedCategories, manageCategoryMappingModalInstanceCtrl.selectedTags, manageCategoryMappingModalInstanceCtrl.tags, process.id);
      });
    });
    describe('category update service', function() {
      var categoryManager, processCategoryAPI, categoryAPI;
      beforeEach(function() {
        module(function($provide) {
          processCategoryAPI = jasmine.createSpyObj('processCategoryAPI', ['save', 'delete']);
          categoryAPI = jasmine.createSpyObj('categoryAPI', ['save']);
          $provide.value('processCategoryAPI', processCategoryAPI);
          $provide.value('categoryAPI', categoryAPI);
        });

        inject(function($injector) {
          categoryManager = $injector.get('categoryManager');
        });
      });
      describe('categoryIsSelected', function() {
        it('should return false when the an empty category or an empty tag list is given ', function() {
          var cat;
          expect(categoryManager.categoryIsSelected(cat, ['rock', 'pop', 'blues', 'funk'])).toBeFalsy();
          cat = {name : 'pop'};
          expect(categoryManager.categoryIsSelected(cat)).toBeFalsy();
        });
        it('should return true when the given category name is in the tag list', function() {
          var cat = {name : 'pop'};
          expect(categoryManager.categoryIsSelected(cat, ['rock', 'pop', 'blues', 'funk'])).toBeTruthy();
        });
        it('should return false when the given category name is not in the tag list', function() {
          var cat = {name : 'metal'};
          expect(categoryManager.categoryIsSelected(cat, ['rock', 'pop', 'blues', 'funk'])).toBeFalsy();
        });
      });
      describe('categoryWasInitiallySelected', function() {
        it('should return false when the an empty category or an empty category list is given ', function() {
          expect(categoryManager.categoryWasInitiallySelected(undefined, categories)).toBeFalsy();
          var cat = {name : 'pop'};
          expect(categoryManager.categoryWasInitiallySelected(cat)).toBeFalsy();
        });
        it('should return true when the given category is in the category list', function() {
          var cat = {id : 111};
          expect(categoryManager.categoryWasInitiallySelected(cat, categories)).toBeTruthy();
          cat = {id : 222};
          expect(categoryManager.categoryWasInitiallySelected(cat, categories)).toBeTruthy();
        });
        it('should return false when the given category is in the category list', function() {
          var cat = {id : 444};
          expect(categoryManager.categoryWasInitiallySelected(cat, categories)).toBeFalsy();
        });
      });

      describe('createNewCategories', function() {
        it('should not throw error when nothing is passed ', function() {
          expect(categoryManager.createNewCategoriesPromises()).toEqual([]);
          expect(categoryManager.createNewCategoriesPromises([], [], [])).toEqual([]);
        });
        it('should save not existing tags, create mapping and return promises ', function() {
          var deferredCategory = q.defer();
          var deferredProcessCategory = q.defer();
          var newTag = 'catego4';
          categoryAPI.save.and.returnValue({$promise : deferredCategory.promise});
          deferredCategory.resolve({id: 456});
          processCategoryAPI.save.and.returnValue({$promise : deferredProcessCategory.promise});
          categoryManager.createNewCategoriesPromises([cat1], [cat2.name, cat3.name], [newTag], process.id);
          scope.$apply();
          expect(categoryAPI.save).toHaveBeenCalledWith({name : newTag});
          expect(processCategoryAPI.save).toHaveBeenCalledWith({
            'category_id': 456,
            'process_id': 123
          });
        });
      });
      describe('updateCategories', function() {
        xit('should save some categoryProcess, delete some and wait for promises to be resolved', function() {
          cat1 = {id:111, name: 'catego1'};
          cat2 = {id:222, name: 'catego2'};
          cat3 = {id:333, name: 'catego3'};
          categories = [cat1, cat2, cat3];
          process = {id: 123};

          categoryManager.saveCategoryProcessIfNotAlreadySelected = jasmine.createSpy();
          categoryManager.deleteCategoryProcessIfNeeded = jasmine.createSpy();
          categoryManager.createNewCategoriesPromises = jasmine.createSpy();
          categoryManager.selectedCategoriesPopulatePromise = jasmine.createSpy();
          var initiallySelectedCategories = [cat1, cat2];
          var selectedTags = ['catego2', 'catego3', 'catego4'];
          var tags = ['catego1', 'catego2', 'catego3'];
          categoryManager.updateCategories(categories, initiallySelectedCategories, selectedTags, tags, 123);
          expect(categoryManager.saveCategoryProcessIfNotAlreadySelected.calls.allArgs()).toBe([[cat2, initiallySelectedCategories, [], process.id], [cat3, initiallySelectedCategories, [], process.id]]);
          expect(categoryManager.deleteCategoryProcessIfNeeded).toHaveBeenCalled();
          expect(categoryManager.createNewCategoriesPromises).toHaveBeenCalled();
          expect(categoryManager.selectedCategoriesPopulatePromise).toHaveBeenCalled();
        });
      });
    });
  });
})();