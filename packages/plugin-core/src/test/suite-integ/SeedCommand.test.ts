import { tmpDir } from "@dendronhq/common-server";
import { SeedService } from "@dendronhq/engine-server";
import { TestSeedUtils } from "@dendronhq/engine-test-utils";
import sinon from "sinon";
import { SeedAddCommand } from "../../commands/SeedAddCommand";
import { SeedRemoveCommand } from "../../commands/SeedRemoveCommand";
import { DENDRON_COMMANDS } from "../../constants";
import { expect } from "../testUtilsv2";
import { runLegacyMultiWorkspaceTest, setupBeforeAfter } from "../testUtilsV3";

function getFakedAddCommand(svc: SeedService) {
  const cmd = new SeedAddCommand(svc);

  const fakedOnUpdating = sinon.fake.resolves(null);
  const fakedOnUpdated = sinon.fake.resolves(null);

  sinon.replace(cmd, <any>"onUpdatingWorkspace", fakedOnUpdating);
  sinon.replace(cmd, <any>"onUpdatedWorkspace", fakedOnUpdated);

  return { cmd, fakedOnUpdating, fakedOnUpdated };
}

function getFakedRemoveCommand(svc: SeedService) {
  const cmd = new SeedRemoveCommand(svc);

  const fakedOnUpdating = sinon.fake.resolves(null);
  const fakedOnUpdated = sinon.fake.resolves(null);

  sinon.replace(cmd, <any>"onUpdatingWorkspace", fakedOnUpdating);
  sinon.replace(cmd, <any>"onUpdatedWorkspace", fakedOnUpdated);

  return { cmd, fakedOnUpdating, fakedOnUpdated };
}

suite(DENDRON_COMMANDS.SEED_ADD.key, function seedAddTests() {
  const ctx = setupBeforeAfter(this, {});

  test("ok: add seed", (done) => {
    runLegacyMultiWorkspaceTest({
      ctx,
      onInit: async ({ engine, wsRoot }) => {
        const tmp = tmpDir().name;
        const { registryFile } = await TestSeedUtils.createSeedRegistry({
          engine,
          wsRoot: tmp,
        });
        const id = TestSeedUtils.defaultSeedId();
        const seedService = new SeedService({ wsRoot, registryFile });
        const { cmd, fakedOnUpdating, fakedOnUpdated } =
          getFakedAddCommand(seedService);

        const resp = await cmd.execute({ seedId: id });
        expect(resp.error).toBeFalsy();
        expect(resp.data?.seed.name).toEqual("foo");
        expect(resp.data?.seedPath).toContain("dendron.foo");

        expect(fakedOnUpdating.callCount).toEqual(1);
        expect(fakedOnUpdated.callCount).toEqual(1);
        done();
      },
    });
  });

  test("error: try to add duplicate seed", (done) => {
    runLegacyMultiWorkspaceTest({
      ctx,
      onInit: async ({ engine, wsRoot }) => {
        const tmp = tmpDir().name;
        const { registryFile } = await TestSeedUtils.createSeedRegistry({
          engine,
          wsRoot: tmp,
        });
        const id = TestSeedUtils.defaultSeedId();
        const seedService = new SeedService({ wsRoot, registryFile });
        await seedService.addSeed({ id });

        const { cmd, fakedOnUpdating, fakedOnUpdated } =
          getFakedAddCommand(seedService);

        const resp = await cmd.execute({ seedId: id });
        expect(resp.error).toBeTruthy();

        expect(fakedOnUpdating.callCount).toEqual(0);
        expect(fakedOnUpdated.callCount).toEqual(0);

        done();
      },
    });
  });
});

suite(DENDRON_COMMANDS.SEED_REMOVE.key, function seedRemoveTests() {
  const ctx = setupBeforeAfter(this, {});

  test("ok: remove seed", (done) => {
    runLegacyMultiWorkspaceTest({
      ctx,
      onInit: async ({ engine, wsRoot }) => {
        const tmp = tmpDir().name;
        const { registryFile } = await TestSeedUtils.createSeedRegistry({
          engine,
          wsRoot: tmp,
        });
        const id = TestSeedUtils.defaultSeedId();
        const seedService = new SeedService({ wsRoot, registryFile });
        await seedService.addSeed({ id });

        const { cmd, fakedOnUpdating, fakedOnUpdated } =
          getFakedRemoveCommand(seedService);

        const resp = await cmd.execute({ seedId: id });
        expect(resp.error).toBeFalsy();

        expect(fakedOnUpdating.callCount).toEqual(1);
        expect(fakedOnUpdated.callCount).toEqual(1);

        done();
      },
    });
  });

  test("error: remove non-existent seed", (done) => {
    runLegacyMultiWorkspaceTest({
      ctx,
      onInit: async ({ engine, wsRoot }) => {
        const tmp = tmpDir().name;
        const { registryFile } = await TestSeedUtils.createSeedRegistry({
          engine,
          wsRoot: tmp,
        });
        const id = TestSeedUtils.defaultSeedId();
        const seedService = new SeedService({ wsRoot, registryFile });

        const { cmd, fakedOnUpdating, fakedOnUpdated } =
          getFakedRemoveCommand(seedService);

        const resp = await cmd.execute({ seedId: id });
        expect(resp.error).toBeTruthy();
        expect(resp.data).toBeFalsy();

        expect(fakedOnUpdating.callCount).toEqual(0);
        expect(fakedOnUpdated.callCount).toEqual(0);

        done();
      },
    });
  });
});
